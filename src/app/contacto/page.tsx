import Link from "next/link";
import { Metadata } from "next";
import PublicNavbar from "@/components/layout/PublicNavbar";

export const metadata: Metadata = {
  title: "Contacto | Innovar Security",
  description:
    "Contáctanos para instalar cámaras de seguridad en Fómeque, Cundinamarca. Atención profesional y soporte continuo.",
  openGraph: {
    title: "Contacto | Innovar Security",
    description:
      "Contáctanos para instalar cámaras de seguridad en Fómeque, Cundinamarca.",
    type: "website",
  },
};

const contactInfo = [
  {
    label: "Teléfono",
    value: "304 445 1436",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    label: "Ubicación",
    value: "Fómeque, Cundinamarca, Colombia",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    label: "Email",
    value: "contacto@innovarsecurity.com",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    label: "Horario",
    value: "Lunes a Viernes, 8:00 AM - 6:00 PM",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function ContactoPage() {
  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen bg-[var(--color-black)] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16">
            <p className="text-sm font-medium text-[var(--color-accent)] uppercase tracking-wider mb-3">
              Contacto
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text-primary)] mb-4">
              Háblanos
            </h1>
            <p className="text-[var(--color-text-secondary)] max-w-xl text-lg">
              Estamos listos para ayudarte con la seguridad de tu hogar o negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact info */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactInfo.map((item) => (
                  <div
                    key={item.label}
                    className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center text-[var(--color-accent)] mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-1">
                      {item.label}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="relative h-64 sm:h-72 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <svg className="w-10 h-10 text-[var(--color-accent)] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                  </svg>
                  <p className="text-[var(--color-text-secondary)] font-medium">Fómeque, Cundinamarca</p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">Colombia</p>
                </div>
              </div>
            </div>

            {/* Contact notice */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                Contáctanos directamente
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mb-8">
                El formulario de contacto estará habilitado próximamente. Mientras tanto, comunícate con nosotros por los siguientes medios:
              </p>

              <div className="space-y-4">
                <a
                  href="tel:+573044451436"
                  className="flex items-center gap-4 p-4 bg-[var(--color-black)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center text-[var(--color-accent)] shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">Teléfono</p>
                    <p className="text-sm text-[var(--color-accent)]">304 445 1436</p>
                  </div>
                </a>

                <a
                  href="https://wa.me/573044451436"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-[var(--color-black)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center text-[var(--color-accent)] shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">WhatsApp</p>
                    <p className="text-sm text-[var(--color-accent)]">304 445 1436</p>
                  </div>
                </a>

                <a
                  href="mailto:contacto@innovarsecurity.com"
                  className="flex items-center gap-4 p-4 bg-[var(--color-black)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center text-[var(--color-accent)] shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">Correo Electrónico</p>
                    <p className="text-sm text-[var(--color-accent)]">contacto@innovarsecurity.com</p>
                  </div>
                </a>

                <a
                  href="https://maps.google.com/?q=Fómeque,Cundinamarca,Colombia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-[var(--color-black)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center text-[var(--color-accent)] shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">Ubicación</p>
                    <p className="text-sm text-[var(--color-accent)]">Fómeque, Cundinamarca</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--color-black)] border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-[var(--color-accent)] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="font-bold text-white text-lg tracking-tight">
                  Innovar <span className="text-[var(--color-accent)]">Security</span>
                </span>
              </Link>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Soluciones de seguridad profesional para hogares y negocios en Fómeque, Cundinamarca.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">
                Navegación
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/servicios" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                    Servicios
                  </Link>
                </li>
                <li>
                  <Link href="/solicitar" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                    Cómo Funciona
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                    Iniciar Sesión
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">
                Contacto
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <svg className="w-4 h-4 text-[var(--color-accent)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  304 445 1436
                </li>
                <li className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                  <svg className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  Fómeque, Cundinamarca, Colombia
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">
                Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/terminos" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                    Privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="py-6 border-t border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-faint)]">
              © {new Date().getFullYear()} Innovar Security. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
