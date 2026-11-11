export interface EmailProvider {
  name: string;
  send(to: string, subject: string, html: string): Promise<EmailResult>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
