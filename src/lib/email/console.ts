import { EmailProvider, EmailResult } from "./types";

export class ConsoleEmailProvider implements EmailProvider {
  name = "console";

  async send(to: string, subject: string, html: string): Promise<EmailResult> {
    console.log("========== EMAIL (CONSOLE MODE) ==========");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html.replace(/<[^>]*>/g, "").slice(0, 200)}...`);
    console.log("==========================================");
    return { success: true, messageId: `console-${Date.now()}` };
  }
}
