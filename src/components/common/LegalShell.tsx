import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";
import LegalIdentity from "./LegalIdentity";

export default function LegalShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNavbar />
      <main id="contenido-principal" className="legal-page">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-cyan-300 text-xs tracking-[.2em] uppercase mb-4">
            Centro de confianza / Innovar
          </p>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight mb-5">
            {title}
          </h1>
          <p className="text-slate-300 max-w-2xl mb-4">{intro}</p>
          <p className="text-xs text-slate-400 mb-8">
            Versión del 14 de noviembre de 2026
          </p>
          <nav
            aria-label="Información legal"
            className="flex flex-wrap gap-3 mb-10 text-sm"
          >
            {[
              ["/confianza", "Centro de confianza"],
              ["/privacidad", "Privacidad"],
              ["/terminos", "Términos"],
              ["/cookies", "Cookies"],
              ["/atencion", "Peticiones y reclamos"],
            ].map(([href, label]) => (
              <Link className="legal-pill" key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
          <LegalIdentity />
          <article className="legal-prose mt-8">{children}</article>
          <Link href="/" className="inline-block mt-10 text-cyan-300 underline">
            Volver al inicio
          </Link>
        </div>
      </main>
      <footer className="py-7 border-t border-white/10 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Innovar Security
      </footer>
    </>
  );
}
