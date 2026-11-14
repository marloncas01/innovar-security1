import type { Metadata } from "next";
import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";
import QuoteWizard from "@/components/common/QuoteWizard";
import { initialQuoteService } from "@/lib/quote-request";
export const metadata: Metadata = {
  title: "Prepara tu solicitud de cotización",
  description:
    "Cuéntanos qué necesitas para tu hogar, negocio o finca. Prepara un resumen para consultar una propuesta de cámaras de seguridad sin crear cuenta.",
  alternates: { canonical: "/cotizar" },
};
export default function Page({
  searchParams,
}: {
  searchParams: { servicio?: string | string[] };
}) {
  return (
    <>
      <PublicNavbar />
      <main id="contenido-principal" className="quote-page">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <QuoteWizard
            initialService={initialQuoteService(
              typeof searchParams.servicio === "string"
                ? searchParams.servicio
                : undefined,
            )}
          />
          <p className="mt-7 text-center text-sm text-slate-400">
            ¿Prefieres hablar directamente?{" "}
            <a href="tel:+573044451436" className="text-cyan-300 underline">
              304 445 1436
            </a>{" "}
            ·{" "}
            <Link href="/confianza" className="text-cyan-300 underline">
              Centro de confianza
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
