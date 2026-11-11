"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Ignore errors - always show success
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-black">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "8px 8px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.12]">
          <div className="absolute top-[20%] left-[30%] w-1.5 h-1.5 bg-accent rounded-full" />
          <div className="absolute top-[40%] left-[60%] w-1 h-1 bg-accent-light rounded-full" />
          <div className="absolute top-[65%] left-[25%] w-1 h-1 bg-accent rounded-full" />
          <div className="absolute top-[80%] left-[70%] w-1.5 h-1.5 bg-accent-light rounded-full" />
        </div>
        <div className="absolute top-[20%] left-[30%] w-[30%] h-px bg-accent/10" />
        <div className="absolute top-[65%] left-[25%] w-[30%] h-px bg-accent/10" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <div className="mb-8">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-6 shadow-glow">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Innovar Security</h1>
            <p className="text-xl text-metal-400">Plataforma de Gestión</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-black p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shadow-glow">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Innovar Security</span>
            </Link>
          </div>

          <div className="bg-surface border border-border rounded-xl p-8 shadow-inner-glow">
            <h2 className="text-2xl font-bold text-white mb-1">Recuperar Contraseña</h2>
            <p className="text-metal-400 text-sm mb-6">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
            </p>

            {submitted ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-400">
                  Si el correo está registrado, recibirás un enlace de recuperación. Revisa tu bandeja de entrada.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />

                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Enviar enlace de recuperación
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-metal-500">
              ¿Recordaste tu contraseña?{" "}
              <Link href="/login" className="text-accent hover:text-accent-light transition-colors font-medium">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
