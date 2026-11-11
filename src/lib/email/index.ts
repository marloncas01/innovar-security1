import { EmailProvider } from "./types";
import { ConsoleEmailProvider } from "./console";

let provider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (provider) return provider;

  const emailType = process.env.EMAIL_PROVIDER || "console";

  switch (emailType) {
    case "console":
    default:
      provider = new ConsoleEmailProvider();
      break;
      // Future: case "resend": provider = new ResendEmailProvider(); break;
      // Future: case "sendgrid": provider = new SendGridEmailProvider(); break;
  }

  return provider;
}
