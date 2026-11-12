import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const business = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Innovar Security",
  url: siteUrl,
  description: "Instalación y mantenimiento de cámaras de seguridad en Fómeque, Cundinamarca.",
  telephone: "+573044451436",
  email: "contacto@innovarsecurity.com",
  address: { "@type": "PostalAddress", addressLocality: "Fómeque", addressRegion: "Cundinamarca", addressCountry: "CO" },
  areaServed: { "@type": "City", name: "Fómeque" },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "18:00" }],
};

export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business).replace(/</g, "\\u003c") }} /><HomePage /></>;
}
