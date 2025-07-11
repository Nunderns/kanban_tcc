declare module 'resend' {
  export class Resend {
    constructor(apiKey?: string);
    sendEmail(params: {
      from: string;
      to: string | string[];
      subject: string;
      html: string;
    }): Promise<{ data?: { id: string }; error?: Error }>;
  }
}
