"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import NotificationBell from "@/components/layout/NotificationBell";

const clientNavItems = [
  { label: "Mis Citas", href: "/citas" },
  { label: "Nueva Cita", href: "/citas/nueva" },
  { label: "Mi Perfil", href: "/perfil" },
  { label: "Asistente", href: "/chatbot" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-primary-950">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-metal-900 border-b border-metal-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="font-semibold text-white text-sm sm:inline">Innovar Security</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-1">
              {clientNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-accent/10 text-accent"
                      : "text-metal-400 hover:text-white hover:bg-metal-800"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <NotificationBell href="/notificaciones" role="client" />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-metal-400 hover:text-white transition-colors hidden sm:inline"
              >
                Cerrar sesión
              </button>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="sm:hidden text-metal-400 hover:text-white p-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileOpen && (
            <div className="sm:hidden pb-4 border-t border-metal-700 mt-2 pt-3 space-y-1">
              {clientNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-accent/10 text-accent"
                      : "text-metal-400 hover:text-white hover:bg-metal-800"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/notificaciones"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-metal-400 hover:text-white hover:bg-metal-800"
              >
                Notificaciones
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full text-left px-3 py-2 text-sm text-metal-400 hover:text-white rounded-lg"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-metal-700 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-metal-500">
            © {new Date().getFullYear()} Innovar Security. Protección profesional.
          </p>
        </div>
      </footer>
    </div>
  );
}
