// Environment variables
const NODE_ENV = process.env.NODE_ENV || 'development';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@kanbantcc.com';

// Log environment status
console.log('=== EMAIL MODULE INITIALIZATION ===');
console.log('NODE_ENV:', NODE_ENV);
console.log('RESEND_API_KEY:', RESEND_API_KEY ? '*** (presente)' : 'Ausente!');
console.log('RESEND_FROM_EMAIL:', RESEND_FROM_EMAIL);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Não definido');

// Define types for the Resend client
type EmailPayload = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  reply_to?: string;
};

type EmailResponse = {
  data?: { id: string };
  error?: { message: string; statusCode: number };
};

// Create a mock Resend client that does nothing but log calls
const createMockResendClient = () => ({
  emails: {
    send: async (payload: EmailPayload): Promise<EmailResponse> => {
      console.log('[MOCK] Email would be sent:', {
        to: payload.to,
        subject: payload.subject,
        from: payload.from,
        reply_to: payload.reply_to,
        preview: payload.html.substring(0, 100) + '...',
      });
      return { data: { id: 'mock-email-id' } };
    },
  },
});

// Type for the Resend client with emails property
interface ResendClientWithEmails {
  emails: {
    send: (payload: EmailPayload) => Promise<EmailResponse>;
  };
}

// Extend the Resend module types
declare module 'resend' {
  interface Resend {
    emails: {
      send(payload: EmailPayload): Promise<{ id: string }>;
    };
  }
}

let resendClient: ResendClientWithEmails | null = null;
let resendInitialized = false;

// Use a type assertion to handle the dynamic import
const initResend = (): ResendClientWithEmails => {
  if (resendClient) return resendClient;
  if (resendInitialized) return createMockResendClient();
  
  resendInitialized = true;
  
  const initResendClient = async () => {
    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set. Using mock email client.');
      return createMockResendClient();
    }

    try {
      // Use dynamic import with await for better error handling
      const resendModule = await import('resend');
      const client = new resendModule.Resend(RESEND_API_KEY);
      
      // Create a wrapper around the actual Resend client
      const clientWithEmails = client as unknown as { 
        emails: { 
          send: (payload: EmailPayload) => Promise<{ id: string }> 
        } 
      };
      
      return {
        emails: {
          send: async (payload: EmailPayload): Promise<EmailResponse> => {
            try {
              const response = await clientWithEmails.emails.send(payload);
              return { data: { id: response.id } };
            } catch (error) {
              console.error('Error sending email:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
              const statusCode = (error as { statusCode?: number }).statusCode || 500;
              return {
                error: {
                  message: errorMessage,
                  statusCode,
                },
              };
            }
          },
        },
      };
    } catch (error) {
      console.error('Failed to initialize Resend client:', error);
      return createMockResendClient();
    }
  };

  // Start the initialization but don't wait for it
  initResendClient().then(client => {
    resendClient = client;
    console.log('Resend client initialized successfully');
  });
  
  // Return mock client immediately, it will be replaced when the real one is ready
  return createMockResendClient();
};

// Export the Resend client with proper typing
export const resend = {
  emails: {
    send: async (payload: EmailPayload): Promise<EmailResponse> => {
      const client = initResend();
      try {
        return await client.emails.send(payload);
      } catch (error) {
        console.error('Error sending email:', error);
        return {
          error: {
            message: 'Failed to send email',
            statusCode: 500,
          },
        };
      }
    },
  },
};

export const sendInvitationEmail = async (params: {
  to: string | string[];
  token: string;
  workspaceName: string;
}) => {
  console.log('=== STARTING EMAIL SEND PROCESS ===');
  
  const { to, token, workspaceName } = params;
  const recipients = Array.isArray(to) ? to : [to];
  const inviteLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite?token=${token}`;
  
  // In development or if Resend client is not available, log the email instead of sending it
  if (NODE_ENV !== 'production' || !resendClient) {
    console.log('\n=== EMAIL NOT SENT (Development Mode) ===');
    console.log('To:', recipients);
    console.log('Subject:', `Você foi convidado para o workspace ${workspaceName}`);
    console.log('Invite Link:', inviteLink);
    console.log('\n');
    return { 
      id: 'simulated-email-id', 
      message: 'Email logged instead of sent in development',
      recipients,
      workspaceName,
      inviteLink
    };
  }

  try {
    console.log('Sending email via Resend...');
    
    // This check is redundant but keeps TypeScript happy
    if (!resendClient) {
      throw new Error('Resend client is not initialized');
    }

    const { data, error } = await resendClient.emails.send({
      from: `Kanban TCC <${RESEND_FROM_EMAIL}>`,
      to: recipients,
      subject: `Você foi convidado para o workspace ${workspaceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Você foi convidado para o workspace ${workspaceName}</h2>
          <p style="color: #4b5563; margin-bottom: 20px;">Clique no botão abaixo para aceitar o convite:</p>
          <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 500;">
            Aceitar convite
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
          <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; font-size: 14px;">${inviteLink}</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">Este link expirará em 7 dias.</p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error while sending email:', error);
    // In production, we might want to log this to an error tracking service
    if (NODE_ENV === 'production') {
      console.error('Production error sending email:', error);
    }
    throw error;
  }
};
