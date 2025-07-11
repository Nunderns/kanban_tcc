import { Resend } from 'resend';

// Environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@kanbantcc.com';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Log environment status
console.log('=== RESEND EMAIL MODULE INITIALIZATION ===');
console.log('NODE_ENV:', NODE_ENV);
console.log('RESEND_API_KEY:', RESEND_API_KEY ? '*** (presente)' : 'Ausente!');
console.log('RESEND_FROM_EMAIL:', RESEND_FROM_EMAIL);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Não definido');

// Initialize Resend client
let resendClient: Resend | null = null;

try {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not defined in environment variables');
  }
  
  resendClient = new Resend(RESEND_API_KEY);
  console.log('Resend client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Resend client:', error);
  if (NODE_ENV === 'production') {
    // In production, we want to fail fast if email service is not available
    throw new Error('Failed to initialize email service');
  }
  // In development, we can continue without email functionality
  console.warn('Running without email functionality in development mode');
}

export const resend = resendClient;

export const sendInvitationEmail = async (params: {
  to: string | string[];
  token: string;
  workspaceName: string;
}) => {
  console.log('=== STARTING EMAIL SEND PROCESS ===');
  
  const { to, token, workspaceName } = params;
  const recipients = Array.isArray(to) ? to : [to];
  
  // Use environment email or fallback
  const fromEmail = RESEND_FROM_EMAIL;
  const inviteLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite?token=${token}`;
  
  // Log email details
  console.log('Email details:', {
    to: recipients,
    from: fromEmail,
    subject: `Você foi convidado para o workspace ${workspaceName}`,
    inviteLink: inviteLink,
    environment: NODE_ENV
  });
  
  // If in development or no API key, just log the link
  if (NODE_ENV !== 'production' || !resend) {
    console.log('=== DEVELOPMENT MODE: EMAIL NOT SENT ===');
    console.log('Simulated invite link:', inviteLink);
    console.log('To:', recipients);
    console.log('Subject:', `Você foi convidado para o workspace ${workspaceName}`);
    return { id: 'local-dev-simulated' };
  }

  try {
    console.log('Sending email via Resend...');
    
    if (!resend) {
      throw new Error('Resend client is not initialized');
    }

    const { data, error } = await resend.emails.send({
      from: `Kanban TCC <${fromEmail}>`,
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
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error while sending email:', error);
    throw error;
  }
};
