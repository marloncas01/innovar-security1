import type { Metadata } from "next";

export const metadata: Metadata = { title: "Solicitar servicio", description: "Solicita una visita técnica o cotiza tu sistema de seguridad por WhatsApp sin crear una cuenta.", alternates: { canonical: "/solicitar" }, openGraph: { title: "Solicitar servicio | Innovar Security", description: "Solicita una visita técnica o cotiza tu sistema de seguridad por WhatsApp sin crear una cuenta.", url: "/solicitar", images: ["/images/social-preview.png"] } };

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
