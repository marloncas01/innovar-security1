// Keep public links stable even when a preview uses a temporary Vercel domain.
export const siteUrl = "https://innovar-security1.vercel.app";

export const publicPages = ["/", "/servicios", "/solicitar", "/chatbot", "/contacto", "/terminos", "/privacidad"];

export function safeCallbackPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return "/";
  return value;
}
