import type { Metadata } from "next";

export const metadata: Metadata = { title: "Asistente de seguridad", description: "Resuelve tus dudas sobre cámaras, cotizaciones, visitas técnicas y cobertura en Fómeque.", alternates: { canonical: "/chatbot" }, openGraph: { title: "Asistente de seguridad | Innovar Security", description: "Resuelve tus dudas sobre cámaras, cotizaciones, visitas técnicas y cobertura en Fómeque.", url: "/chatbot", images: ["/images/social-preview.png"] } };

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
