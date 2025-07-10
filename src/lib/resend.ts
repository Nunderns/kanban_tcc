import { Resend } from 'resend';

console.log('=== INICIALIZANDO MÓDULO RESEND ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '*** (presente)' : 'Ausente!');
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'Não definido');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Não definido');

if (!process.env.RESEND_API_KEY) {
  console.error('ERRO: RESEND_API_KEY não está definida nas variáveis de ambiente');
  // Não lançamos erro aqui para permitir que o aplicativo inicie
  // em ambientes de desenvolvimento sem a chave
}

if (!process.env.RESEND_FROM_EMAIL) {
  console.warn('AVISO: RESEND_FROM_EMAIL não está definida. Usando e-mail padrão.');
}

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendInvitationEmail = async (params: {
  to: string;
  token: string;
  workspaceName: string;
}) => {
  console.log('=== INICIANDO ENVIO DE E-MAIL ===');
  console.log('Variáveis de ambiente no momento do envio:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '*** (presente)' : 'Ausente!');
  console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'Não definido');
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Não definido');
  
  const { to, token, workspaceName } = params;
  console.log('Parâmetros recebidos:', { to, token: '***', workspaceName });
  
  // Usa o e-mail verificado do ambiente ou um fallback
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@kanbantcc.com';
  console.log('E-mail remetente:', fromEmail);
  
  // Se estiver em desenvolvimento ou sem chave da API, apenas loga o link
  if (process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY) {
    const inviteLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite?token=${token}`;
    console.log('=== MODO SIMULAÇÃO (DEV/SEM API KEY) ===');
    console.log('E-mail NÃO enviado (modo simulação)');
    console.log('De:', `Kanban TCC <${fromEmail}>`);
    console.log('Para:', to);
    console.log('Assunto:', `Você foi convidado para o workspace ${workspaceName}`);
    console.log('Link de convite:', inviteLink);
    console.log('======================================');
    return { id: 'local-dev-simulated' };
  }

  try {
    const inviteLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite?token=${token}`;
    console.log('Preparando para enviar e-mail via Resend...');
    console.log('Link de convite:', inviteLink);
    
    if (!resend) {
      throw new Error('Cliente Resend não inicializado corretamente');
    }
    
    const { data, error } = await resend.emails.send({
      from: `Kanban TCC <${fromEmail}>`,
      to,
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
      console.error('Erro ao enviar e-mail:', JSON.stringify(error, null, 2));
      throw new Error('Falha ao enviar o e-mail de convite: ' + (error.message || 'Erro desconhecido'));
    }

    console.log('E-mail enviado com sucesso!', { emailId: data?.id });
    return data;
  } catch (error) {
    console.error('Erro no serviço de e-mail:', error);
    throw new Error('Erro ao processar o envio do e-mail: ' + (error instanceof Error ? error.message : String(error)));
  }
};
