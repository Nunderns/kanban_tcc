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

// Create a mock Resend client that does nothing but log calls
const mockResendClient = {
  emails: {
    send: async (payload: {
      from: string;
      to: string | string[];
      subject: string;
      html: string;
      reply_to?: string;
    }): Promise<{
      data?: { id: string };
      error?: { message: string; statusCode: number };
    }> => {
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
};

// Try to initialize the real Resend client if possible
let resendClient: typeof mockResendClient | null = null;

const initResend = () => {
  if (resendClient) return resendClient;
  
  if (RESEND_API_KEY) {
    try {
      // Dynamic import to prevent build-time errors if the module is not available
      const { Resend } = require('resend');
      resendClient = new Resend(RESEND_API_KEY);
      console.log('Resend client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Resend client:', error);
      if (NODE_ENV === 'production') {
        console.warn('Running in production without email functionality');
      } else {
        console.warn('Using mock email client in development');
        resendClient = mockResendClient;
      }
    }
  } else {
    console.warn('RESEND_API_KEY not set. Using mock email client.');
    resendClient = mockResendClient;
  }
  
  return resendClient;
};

// Export the Resend client with proper typing
export const resend = {
  emails: {
    send: async (payload: {
      from: string;
      to: string | string[];
      subject: string;
      html: string;
      reply_to?: string;
    }) => {
      const client = initResend();
      if (!client) {
        console.warn('Email client not initialized. Email not sent.');
        return { error: { message: 'Email client not initialized', statusCode: 500 } };
      }
      return client.emails.send(payload);
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
