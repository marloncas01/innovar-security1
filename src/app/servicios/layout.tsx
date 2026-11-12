import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cámaras de seguridad y mantenimiento en Fómeque", description: "Consulta nuestros servicios de instalación de cámaras IP y CCTV, mantenimiento y visitas técnicas en Fómeque, Cundinamarca.", alternates: { canonical: "/servicios" }, openGraph: { title: "Cámaras de seguridad y mantenimiento en Fómeque | Innovar Security", description: "Consulta nuestros servicios de instalación de cámaras IP y CCTV, mantenimiento y visitas técnicas en Fómeque, Cundinamarca.", url: "/servicios", images: ["/images/social-preview.png"] } };

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
