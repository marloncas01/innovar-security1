"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";

export default function SolicitarPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen bg-[var(--color-black)] pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/20 mb-3">
              Proceso Transparente y Rápido
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Solicitar Servicio de Seguridad
            </h1>
            <p className="text-metal-400 max-w-2xl mx-auto text-base">
              Agenda tu visita técnica o instalación de cámaras de seguridad en Fómeque y municipios aledaños.
            </p>
          </div>

          {/* Stepper Card */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">¿Cómo funciona el proceso?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: "1",
                  title: "Elige tu servicio",
                  description: "Selecciona instalación, mantenimiento o visita técnica especializada.",
                },
                {
                  step: "2",
                  title: "Indica ubicación",
                  description: "Comparte la dirección y condiciones del lugar a proteger.",
                },
                {
                  step: "3",
                  title: "Selecciona horario",
                  description: "Elige el día y la hora disponible que mejor se ajuste a tu tiempo.",
                },
                {
                  step: "4",
                  title: "Confirmación y visita",
                  description: "Confirma tu servicio con pago y nuestro técnico asistirá puntualmente.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center md:text-left flex flex-col items-center md:items-start">
                  <div className="w-10 h-10 bg-accent/20 border border-accent/40 rounded-xl flex items-center justify-center mb-3">
                    <span className="text-accent font-bold text-sm">{item.step}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-metal-400 text-xs leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 mb-8">
            <h2 className="text-lg font-bold text-white mb-4">¿Qué información te pediremos?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                "Tipo de servicio requerido (cámaras IP, CCTV, mantenimiento)",
                "Dirección y puntos de referencia en Fómeque o alrededores",
                "Condiciones del sitio (trabajo en altura, acceso o riesgos)",
                "Fotografías del lugar (puedes subirlas para evaluación técnica previa)",
                "Fecha y franja horaria preferida",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-metal-300 bg-black/40 p-3 rounded-xl border border-metal-800">
                  <span className="w-2 h-2 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="text-center bg-gradient-to-b from-metal-900/60 to-black p-8 rounded-2xl border border-[var(--color-border)]">
            {isAuthenticated ? (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">¡Sesión iniciada correctamente!</h3>
                <p className="text-metal-400 text-sm mb-6 max-w-md mx-auto">
                  Puedes iniciar tu formulario de agendamiento de cita técnica en este momento.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/citas/nueva"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl transition-all shadow-glow text-sm"
                  >
                    Agendar Nueva Cita
                  </Link>
                  <Link
                    href="/citas"
                    className="inline-flex items-center justify-center px-8 py-3.5 border border-metal-700 text-metal-300 hover:text-white hover:border-metal-500 font-semibold rounded-xl transition-all text-sm"
                  >
                    Ver Mis Citas
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Comienza ahora</h3>
                <p className="text-metal-400 text-sm mb-6 max-w-md mx-auto">
                  Crea tu cuenta para agendar y hacer seguimiento a tus citas e instalaciones. También puedes solicitar una cotización por WhatsApp sin registrarte.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/registro"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl transition-all shadow-glow text-sm"
                  >
                    Crear Cuenta y Solicitar
                  </Link>
                  <a href="https://wa.me/573044451436?text=Hola%2C%20quiero%20solicitar%20una%20visita%20t%C3%A9cnica" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3.5 text-accent underline font-semibold rounded-xl text-sm">Solicitar por WhatsApp sin cuenta</a>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-8 py-3.5 border border-metal-700 text-metal-300 hover:border-accent hover:text-white font-semibold rounded-xl transition-all text-sm"
                  >
                    Ya tengo cuenta (Iniciar Sesión)
                  </Link>
                </div>
              </div>
            )}

            <p className="text-center text-metal-500 text-xs sm:text-sm mt-6">
              ¿Tienes dudas inmediatas? Escríbenos o llámanos al{" "}
              <a href="tel:3044451436" className="text-accent hover:underline font-medium">
                304 445 1436
              </a>
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-[var(--color-black)] border-t border-[var(--color-border)] py-8 text-center">
        <p className="text-sm text-metal-500">
          © {new Date().getFullYear()} Innovar Security. Todos los derechos reservados.
        </p>
      </footer>
    </>
  );
}
