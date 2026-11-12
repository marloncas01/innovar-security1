"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { defaultFaqs } from "@/lib/public-content";
import PublicNavbar from "@/components/layout/PublicNavbar";

interface ContentSection {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

interface Content {
  hero: ContentSection;
  about: ContentSection;
  services: ContentSection;
  how_it_works: ContentSection;
  contact: ContentSection;
  footer: ContentSection;
}

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  duration: string | null;
  imageUrl: string | null;
  features: string;
  exclusions: string | null;
  requiresVisit: boolean;
}

const fallbackServices = [
  {
    title: "Instalación de Cámaras",
    description:
      "Diseñamos e instalamos sistemas de vigilancia adaptados a las necesidades específicas de tu hogar o negocio.",
    href: "/servicios",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: "Mantenimiento",
    description:
      "Servicio preventivo y correctivo para mantener tu sistema operativo y funcionando al máximo rendimiento.",
    href: "/servicios",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 3.16a.75.75 0 01-1.036-1.036l3.16-5.384m0 0L8.25 7.5m0 0l1.5-1.5m-1.5 1.5l1.5 1.5m0 0l3.075 3.075a4.5 4.5 0 01-6.364 6.364L3.75 17.25" />
      </svg>
    ),
  },
  {
    title: "Visita Técnica",
    description:
      "Evaluamos tu espacio, identificamos puntos críticos y proponemos la solución ideal para tu seguridad.",
    href: "/solicitar",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
];

const fallbackSteps = [
  {
    number: "01",
    title: "Solicita",
    description: "Cuéntanos qué necesitas a través de nuestro formulario.",
  },
  {
    number: "02",
    title: "Agenda",
    description: "Coordinamos una visita técnica en el horario que te convenga.",
  },
  {
    number: "03",
    title: "Instalamos",
    description: "Nuestro equipo instala y configura tu sistema profesionalmente.",
  },
  {
    number: "04",
    title: "Protegido",
    description: "Tu espacio está seguro. Soporte y mantenimiento continuo.",
  },
];

const values = [
  {
    title: "Experiencia local",
    description: "Conocemos Fómeque y sus necesidades. Estamos aquí, cerca de ti.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    title: "Respuesta rápida",
    description: "Atendemos tu solicitud en menos de 24 horas. No dejamos esperando.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: "Calidad profesional",
    description: "Equipos de última generación instalados por técnicos certificados.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    title: "Soporte continuo",
    description: "No te dejamos solo después de la instalación. Siempre disponibles para ti.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const [content, setContent] = useState<Content | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [contentRes, servicesRes] = await Promise.allSettled([
          fetch("/api/content", { signal: AbortSignal.timeout(8000) }),
          fetch("/api/services", { signal: AbortSignal.timeout(8000) }),
        ]);

        if (contentRes.status === "fulfilled" && contentRes.value.ok) {
          const data = await contentRes.value.json();
          if (Array.isArray(data)) {
            const sections: Record<string, Record<string, string>> = {};
            for (const section of data) {
              if (section && ["hero", "about", "services", "how_it_works", "contact", "footer"].includes(section.section)) {
                sections[section.section] = Object.fromEntries(Object.entries(section).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
              }
            }
            setContent(sections as unknown as Content);
          }
        }

        if (servicesRes.status === "fulfilled" && servicesRes.value.ok) {
          const data = await servicesRes.value.json();
          if (Array.isArray(data)) setServices(data.filter((item) => item && typeof item.id === "string" && typeof item.name === "string"));
        }
      } catch {
        // fallback to hardcoded
      }
    }
    fetchData();
  }, []);


  return (
    <>
      <PublicNavbar />

      <main id="contenido-principal">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center bg-black overflow-hidden pt-16">
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-[128px] opacity-[0.07]" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-[var(--color-accent)] rounded-full blur-[100px] opacity-[0.04]" />

        <div className="absolute top-32 right-16 lg:right-32 hidden lg:block">
          <div className="relative w-72 h-72">
            <div className="absolute inset-0 border border-[var(--color-border)] rounded-2xl rotate-6" />
            <div className="absolute inset-4 border border-[var(--color-accent)] rounded-2xl opacity-20 -rotate-3" />
            <div className="absolute inset-8 border border-[var(--color-border)] rounded-2xl rotate-12 opacity-40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--color-accent)] rounded-full opacity-60" />
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-[var(--color-accent)] rounded-full opacity-30" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[var(--color-accent-subtle)] border border-[var(--color-border)] rounded-full px-4 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full" />
              <span className="text-sm text-[var(--color-text-secondary)] font-medium">
                Fómeque, Cundinamarca
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text-primary)] mb-6 leading-[1.1] tracking-tight">
              {content?.hero?.title || "Protección Profesional para tu "}
              {!content?.hero?.title && (
                <>
                  <span className="text-[var(--color-accent)]">Hogar</span>{" "}
                  y <span className="text-[var(--color-accent)]">Negocio</span>
                </>
              )}
            </h1>

            <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] mb-10 max-w-xl leading-relaxed">
              {content?.hero?.subtitle ||
                "Especialistas en instalación y mantenimiento de cámaras de seguridad. Soluciones de vigilancia profesional para Fómeque y Cundinamarca."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={content?.hero?.buttonUrl || "/solicitar"}
                className="inline-flex items-center justify-center px-8 py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white font-semibold rounded-lg transition-all duration-200 text-base"
              >
                {content?.hero?.buttonText || "Solicitar Servicio"}
              </Link>
              <Link
                href="/servicios"
                className="inline-flex items-center justify-center px-8 py-4 border border-[var(--color-border-light)] text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-accent)] font-semibold rounded-lg transition-all duration-200 text-base"
              >
                Ver Servicios
              </Link>
              <a href="https://wa.me/573044451436?text=Hola%2C%20quisiera%20una%20cotizaci%C3%B3n" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-4 text-accent font-semibold underline">
                Cotizar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      {content?.about && (
        <section className="py-24 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-[var(--color-accent)] uppercase tracking-wider mb-3">
                {content.about.subtitle || "Sobre nosotros"}
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
                {content.about.title || "Por qué elegirnos"}
              </h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg">
                {content.about.description || "No somos otra empresa más. Somos tu vecino, tu aliado en seguridad."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      <section className="py-24 bg-[var(--color-black)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-sm font-medium text-[var(--color-accent)] uppercase tracking-wider mb-3">
              Servicios
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
              {content?.services?.title || "Lo que ofrecemos"}
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl">
              {content?.services?.description || "Soluciones completas de seguridad para que tú solo te preocupes por vivir tranquilo."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.length > 0
              ? services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/servicios#${service.slug}`}
                    className="group card-surface card-surface-hover p-8 flex flex-col"
                  >
                    <div className="w-12 h-12 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center text-[var(--color-accent)] mb-6 group-hover:bg-[var(--color-accent-muted)] transition-colors">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
                      {service.name}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex-1">
                      {service.description || "Servicio profesional de seguridad"}
                    </p>
                    <div className="mt-6 text-sm font-medium text-[var(--color-accent)] flex items-center gap-2 group-hover:gap-3 transition-all">
                      Conocer más
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </Link>
                ))
              : fallbackServices.map((service) => (
                  <Link
                    key={service.title}
                    href={service.href}
                    className="group card-surface card-surface-hover p-8 flex flex-col"
                  >
                    <div className="w-12 h-12 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center text-[var(--color-accent)] mb-6 group-hover:bg-[var(--color-accent-muted)] transition-colors">
                      {service.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
                      {service.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex-1">
                      {service.description}
                    </p>
                    <div className="mt-6 text-sm font-medium text-[var(--color-accent)] flex items-center gap-2 group-hover:gap-3 transition-all">
                      Conocer más
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-sm font-medium text-[var(--color-accent)] uppercase tracking-wider mb-3">
              Cómo funciona
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)]">
              {content?.how_it_works?.title || "De la solicitud a la protección"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {fallbackSteps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < fallbackSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-14 right-0 h-px bg-[var(--color-border)]" />
                )}

                <div className="relative flex flex-col">
                  <div className="w-14 h-14 rounded-full bg-[var(--color-black)] border-2 border-[var(--color-border)] flex items-center justify-center mb-5 text-[var(--color-accent)] font-bold text-sm shrink-0">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-24 bg-[var(--color-black)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-sm font-medium text-[var(--color-accent)] uppercase tracking-wider mb-3">
              Por qué elegirnos
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
              Comprometidos con tu seguridad
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl">
              No somos otra empresa más. Somos tu vecino, tu aliado en seguridad.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="card-surface p-8 flex gap-5"
              >
                <div className="w-11 h-11 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center text-[var(--color-accent)] shrink-0">
                  {value.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1.5">
                    {value.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section className="py-24 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
            {content?.contact?.title || "¿Listo para proteger tu espacio?"}
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-10 max-w-lg mx-auto text-lg">
            {content?.contact?.description || "Solicita tu visita técnica hoy mismo y recibe un plan de seguridad sin compromiso."}
          </p>
          <Link
            href={content?.contact?.buttonUrl || "/solicitar"}
            className="inline-flex items-center justify-center px-10 py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white font-semibold rounded-lg transition-all duration-200 text-base"
          >
            {content?.contact?.buttonText || "Solicitar Ahora"}
          </Link>
        </div>
      </section>

      <section className="py-20 bg-black border-t border-border" aria-labelledby="faq-title">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-accent text-sm uppercase tracking-wider mb-3">Resolvemos tus dudas</p>
          <h2 id="faq-title" className="text-3xl font-bold text-white mb-8">Antes de solicitar tu servicio</h2>
          <div className="space-y-3">
            {defaultFaqs.map((item) => (
              <details key={item.id} className="rounded-xl border border-border bg-surface p-5">
                <summary className="cursor-pointer font-semibold text-white">{item.question}</summary>
                <p className="mt-4 text-metal-300 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
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
                {content?.footer?.description || "Soluciones de seguridad profesional para hogares y negocios en Fómeque, Cundinamarca."}
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
              © {new Date().getFullYear()} {content?.footer?.title || "Innovar Security"} Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
