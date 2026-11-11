"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Servicios", href: "/servicios" },
  { label: "Cómo Funciona", href: "/solicitar" },
  { label: "Asistente Virtual", href: "/chatbot" },
  { label: "Contacto", href: "/contacto" },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center transition-all group-hover:shadow-glow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg tracking-tight hidden sm:block">
              Innovar <span className="text-accent">Security</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                  pathname === link.href
                    ? "text-white bg-white/5"
                    : "text-metal-400 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    className="px-4 py-2 text-sm font-semibold bg-accent hover:bg-accent-dark text-white rounded-lg transition-all hover:shadow-glow"
                  >
                    Panel Admin
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/citas"
                      className="px-4 py-2 text-sm font-medium text-metal-300 hover:text-white transition-colors"
                    >
                      Mis Citas
                    </Link>
                    <Link
                      href="/citas/nueva"
                      className="px-5 py-2 text-sm font-semibold bg-accent hover:bg-accent-dark text-white rounded-lg transition-all hover:shadow-glow"
                    >
                      Agendar Cita
                    </Link>
                  </>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-3 py-2 text-xs font-medium text-metal-400 hover:text-white transition-colors"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-metal-300 hover:text-white transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/solicitar"
                  className="px-5 py-2 text-sm font-semibold bg-accent hover:bg-accent-dark text-white rounded-lg transition-all hover:shadow-glow"
                >
                  Solicitar Servicio
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-metal-400 hover:text-white transition-colors"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-white/5 animate-slide-down">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    pathname === link.href
                      ? "text-white bg-white/5"
                      : "text-metal-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/5 my-2" />
              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="mx-4 px-4 py-3 text-sm font-semibold bg-accent text-white rounded-lg text-center"
                    >
                      Panel Admin
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/citas"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-metal-300 hover:text-white"
                      >
                        Mis Citas
                      </Link>
                      <Link
                        href="/citas/nueva"
                        onClick={() => setMobileOpen(false)}
                        className="mx-4 px-4 py-3 text-sm font-semibold bg-accent text-white rounded-lg text-center"
                      >
                        Agendar Cita
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="px-4 py-3 text-left text-sm font-medium text-red-400 hover:text-red-300"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-metal-400 hover:text-white transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/solicitar"
                    onClick={() => setMobileOpen(false)}
                    className="mx-4 mt-2 px-4 py-3 text-sm font-semibold bg-accent hover:bg-accent-dark text-white rounded-lg transition-all text-center"
                  >
                    Solicitar Servicio
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
