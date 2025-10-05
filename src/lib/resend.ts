type EmailPayload = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  reply_to?: string;
};

type EmailResponse =
  | { data: { id: string }; error?: undefined }
  | { error: { message: string; statusCode: number }; data?: undefined };
const NODE_ENV = process.env.NODE_ENV || "development";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "noreply@kanbantcc.com";
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
const FORCE_SEND = process.env.FORCE_SEND_EMAILS === "1";

const createMockResendClient = () => ({
  emails: {
    send: async (payload: EmailPayload): Promise<EmailResponse> => {
      console.log("\n[MOCK] Email seria enviado com os dados abaixo:");
      console.log(
        JSON.stringify(
          {
            to: payload.to,
            subject: payload.subject,
            from: payload.from,
            reply_to: payload.reply_to,
            preview: payload.html.slice(0, 120) + "...",
          },
          null,
          2
        )
      );
      return { data: { id: "mock-email-id" } };
    },
  },
});

interface ResendEmailResponse {
  data?: { id: string };
  error?: { message: string; statusCode?: number };
  statusCode?: number;
}

interface ResendClient {
  emails: {
    send: (payload: EmailPayload) => Promise<ResendEmailResponse>;
  };
}

interface ResendClientWithEmails {
  emails: {
    send: (payload: EmailPayload) => Promise<EmailResponse>;
  };
}

let resendClient: ResendClientWithEmails | null = null;

const initResend = async (): Promise<ResendClientWithEmails> => {
  if (resendClient) return resendClient;

  if (!RESEND_API_KEY) {
    console.warn(
      "[resend] RESEND_API_KEY ausente — usando mock (dry-run garantido)."
    );
    resendClient = createMockResendClient();
    return resendClient;
  }

  try {
    const { Resend } = await import("resend");
    const real = new Resend(RESEND_API_KEY) as unknown as ResendClient;

    resendClient = {
      emails: {
        send: async (payload: EmailPayload): Promise<EmailResponse> => {
          try {
            const resp = await real.emails.send(payload);

            if (resp && typeof resp === 'object' && 'error' in resp && resp.error) {
              const message = resp.error.message || 'Failed to send email';
              const statusCode = resp.statusCode || 500;
              return { error: { message, statusCode } };
            }

            const id = resp?.data?.id ?? 'unknown-id';
            if (id === 'unknown-id') {
              console.warn("[resend] Resposta sem id esperado:", resp);
            }
            return { data: { id } };
          } catch (err: unknown) {
            let message = 'Failed to send email';
            let statusCode = 500;
            
            if (err && typeof err === 'object') {
              if ('message' in err && typeof err.message === 'string') {
                message = err.message;
              } else if ('toString' in err && typeof err.toString === 'function') {
                message = err.toString();
              }
              if ('statusCode' in err && typeof err.statusCode === 'number') {
                statusCode = err.statusCode;
              }
            }
            
            console.error("[resend] Falha ao enviar email:", message);
            return { error: { message, statusCode } };
          }
        },
      },
    };

    return resendClient;
  } catch (error) {
    console.error(
      "[resend] Falha ao inicializar cliente real, caindo no mock:",
      error
    );
    resendClient = createMockResendClient();
    return resendClient;
  }
};

export async function sendWelcomeEmail(params: {
  to: string;
  name?: string;
}) {
  const { to, name = 'usuário' } = params;
  
  const subject = 'Bem-vindo(a) ao TaskFlow!';
  const html = `
    <div style="font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1F2937;">
      <div style="background-color: #4F46E5; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">TaskFlow</h1>
      </div>
      
      <div style="padding: 32px; background-color: #ffffff; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #111827; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Olá, ${name}!</h2>
        
        <p style="margin-bottom: 16px; line-height: 1.6;">Seja muito bem-vindo(a) ao TaskFlow! Estamos muito felizes em tê-lo(a) conosco. 🎉</p>
        
        <div style="background-color: #F9FAFB; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4F46E5;">
          <p style="margin: 0; font-weight: 500; color: #111827;">Dicas para começar:</p>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #4B5563;">
            <li style="margin-bottom: 8px;">Crie seu primeiro projeto</li>
            <li style="margin-bottom: 8px;">Adicione tarefas e organize-as nos quadros</li>
            <li>Convide membros da equipe para colaborar</li>
          </ul>
        </div>
        
        <p style="margin-bottom: 24px; line-height: 1.6;">Se precisar de ajuda ou tiver alguma dúvida, é só responder a este e-mail. Nossa equipe está à disposição para ajudar!</p>
        
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background-color: #4F46E5; color: white; text-decoration: none; font-weight: 500; padding: 12px 24px; border-radius: 6px; margin: 8px 0 24px 0;">
          Acessar Minha Conta
        </a>
        
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB; font-size: 14px; color: #6B7280;">
          <p style="margin: 0 0 8px 0;">Atenciosamente,<br><strong>Equipe TaskFlow</strong></p>
          <p style="margin: 0; font-size: 13px; color: #9CA3AF;">Este é um e-mail automático, por favor não responda diretamente a esta mensagem.</p>
        </div>
      </div>
    </div>
  `;

  return sendHtmlEmail({
    to,
    subject,
    html,
    fromName: 'TaskFlow Team'
  });
}

export const resend = {
  emails: {
    send: async (payload: EmailPayload): Promise<EmailResponse> => {
      const client = await initResend();
      const isProd = NODE_ENV === "production";
      if (!isProd && !FORCE_SEND) {
        return { data: { id: "simulated-email-id" } };
      }
      return client.emails.send(payload);
    },
  },
};

export const sendInvitationEmail = async (params: {
  to: string | string[];
  token: string;
  workspaceName: string;
  inviterName?: string;
  inviterEmail?: string;
  temporaryPassword?: string;
}) => {
  const { to, token, workspaceName, inviterName } = params;
  const recipients = Array.isArray(to) ? to : [to];
  const slug = workspaceName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!slug || slug.length === 0) {
    throw new Error('Workspace inválida: ' + workspaceName);
  }
  
  const inviteLink = `${NEXTAUTH_URL}/register?email=${encodeURIComponent(recipients[0])}&invitation_id=${encodeURIComponent(token)}&workspace=${encodeURIComponent(slug)}`;

  const isProd = NODE_ENV === "production";
  const canSendForReal = (isProd || FORCE_SEND) && !!RESEND_API_KEY;

  if (!canSendForReal) {
    return {
      id: "simulated-email-id",
      message: "Email logged instead of sent in development",
      recipients,
      workspaceName,
      inviteLink,
    };
  }

  const client = await initResend();
  const res = await client.emails.send({
    from: `TaskFlow <${RESEND_FROM_EMAIL}>`,
    to: recipients,
    subject: `${inviterName || 'Someone'} has invited you to join them in ${workspaceName} on TaskFlow`,
    html: `
      <div style="font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1F2937;">
        <div style="background-color: #4F46E5; padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">TaskFlow</h1>
          <p style="color: #E0E7FF; margin: 8px 0 0 0; font-size: 16px;">Seu workspace para projetos e progresso</p>
        </div>
        
        <div style="padding: 40px; background-color: #ffffff; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background-color: #FEF3C7; padding: 16px 24px; border-radius: 50px; margin-bottom: 24px;">
              <span style="color: #92400E; font-weight: 600; font-size: 18px;">🎉 You are a celebrated colleague!</span>
            </div>
            
            <h2 style="color: #111827; font-size: 24px; margin-top: 0; margin-bottom: 16px; font-weight: 700;">
              ${inviterName || 'Someone'} has invited you to join them in ${workspaceName} on TaskFlow.
            </h2>
            
            <p style="color: #4B5563; font-size: 18px; line-height: 1.6; margin-bottom: 24px;">
              Some of our users have told us it's a privilege, but we will let you be the judge of that.
            </p>
            
            <div style="text-align: center; margin-top: 32px;">
              <a href="${inviteLink}" style="display: inline-block; background-color: #4F46E5; color: white; text-decoration: none; font-weight: 600; padding: 16px 32px; border-radius: 8px; font-size: 16px; transition: background-color 0.2s;">
                Join them on TaskFlow
              </a>
            </div>
          </div>
          
          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #E5E7EB; text-align: center;">
            <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px 0;">Obrigado por se interessar por nossas soluções!</p>
            <p style="color: #111827; font-size: 16px; margin: 0; font-weight: 600;">Um grande abraço,<br><span style="color: #4F46E5;">Time TaskFlow!</span></p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 16px; color: #9CA3AF; font-size: 12px;">
          <p style="margin: 0;">This email was sent to ${recipients[0]}. Please delete if you are not the intended recipient.</p>
        </div>
      </div>
    `,
  });

  if ("error" in res && res.error) {
    throw new Error(`Failed to send email: ${res.error.message}`);
  }

  return res.data;
};


export const sendHtmlEmail = async (payload: {
  to: string | string[];
  subject: string;
  html: string;
  fromName?: string;
  reply_to?: string;
}) => {
  const { to, subject, html, reply_to, fromName = "TaskFlow" } = payload;

  const isProd = NODE_ENV === "production";
  const canSendForReal = (isProd || FORCE_SEND) && !!RESEND_API_KEY;

  if (!canSendForReal) {
    return { id: "simulated-email-id" };
  }

  const client = await initResend();
  const res = await client.emails.send({
    from: `${fromName} <${RESEND_FROM_EMAIL}>`,
    to,
    subject,
    html,
    reply_to,
  });

  if ("error" in res && res.error) {
    throw new Error(`Falha ao enviar email: ${res.error.message}`);
  }
  return res.data;
};
