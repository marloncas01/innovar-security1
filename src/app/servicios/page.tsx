"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PublicNavbar from "@/components/layout/PublicNavbar";

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  duration: number | null;
  imageUrl: string | null;
  features: string;
  exclusions: string;
  requiresVisit: boolean;
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

function SkeletonCard() {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 animate-pulse">
      <div className="h-5 w-32 bg-[var(--color-border)] rounded mb-4" />
      <div className="h-4 w-full bg-[var(--color-border)] rounded mb-2" />
      <div className="h-4 w-3/4 bg-[var(--color-border)] rounded mb-6" />
      <div className="space-y-2 mb-6">
        <div className="h-3 w-24 bg-[var(--color-border)] rounded" />
        <div className="h-3 w-20 bg-[var(--color-border)] rounded" />
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-3 w-full bg-[var(--color-border)] rounded" />
        <div className="h-3 w-5/6 bg-[var(--color-border)] rounded" />
        <div className="h-3 w-4/6 bg-[var(--color-border)] rounded" />
      </div>
      <div className="h-10 w-full bg-[var(--color-border)] rounded-lg" />
    </div>
  );
}

export default function ServiciosPage() {
  const { data: session } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen bg-[var(--color-black)] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16">
            <p className="text-sm font-medium text-[var(--color-accent)] uppercase tracking-wider mb-3">
              Servicios
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text-primary)] mb-4">
              Nuestros Servicios
            </h1>
            <p className="text-[var(--color-text-secondary)] max-w-xl text-lg">
              Soluciones profesionales de seguridad para tu hogar o negocio.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
              <svg className="w-12 h-12 text-[var(--color-text-faint)] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25-2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              <p className="text-[var(--color-text-secondary)] font-medium text-lg">
                Los servicios estarán disponibles pronto.
              </p>
              <p className="text-[var(--color-text-muted)] text-sm mt-2">
                Contacta al administrador para más información.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                let features: string[] = [];
                let exclusions: string[] = [];
                try {
                  features = JSON.parse(service.features);
                } catch {
                  features = [];
                }
                try {
                  exclusions = JSON.parse(service.exclusions);
                } catch {
                  exclusions = [];
                }

                return (
                  <div
                    key={service.id}
                    className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 hover:border-[var(--color-accent)]/30 transition-all duration-200 flex flex-col"
                  >
                    {/* Name */}
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
                      {service.name}
                    </h3>

                    {/* Description */}
                    {service.description && (
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                        {service.description}
                      </p>
                    )}

                    {/* Price + Duration */}
                    <div className="mb-4">
                      {service.price != null ? (
                        <p className="text-xl font-bold text-[var(--color-accent)]">
                          {formatCOP(service.price)}
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-[var(--color-text-muted)] italic">
                          Precio sujeto a cotización
                        </p>
                      )}
                      {service.duration != null && (
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                          Duración: {service.duration} min
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    {features.length > 0 && (
                      <ul className="space-y-1.5 mb-4 flex-1">
                        {features.map((f, i) => (
                          <li
                            key={i}
                            className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full mt-1.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Exclusions */}
                    {exclusions.length > 0 && (
                      <ul className="space-y-1.5 mb-4">
                        {exclusions.map((e, i) => (
                          <li
                            key={i}
                            className="text-xs text-[var(--color-text-faint)] flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 bg-red-500/60 rounded-full mt-1.5 shrink-0" />
                            {e}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* CTA */}
                    <Link
                      href={session ? "/citas/nueva" : "/solicitar"}
                      className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white font-semibold rounded-lg transition-all duration-200 text-sm mt-auto shadow-glow"
                    >
                      Solicitar Servicio
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
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
