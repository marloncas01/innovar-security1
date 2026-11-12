"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor="password" className="block text-sm font-medium text-metal-200">
        Contraseña
        <span className="text-red-400 ml-1">*</span>
      </label>
      <div className="relative">
        <input
          id="password"
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          autoComplete={autoComplete}
          className="w-full h-10 px-3 pr-10 bg-metal-900 border border-metal-700 rounded-lg text-white placeholder-metal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-metal-400 hover:text-metal-200 transition-colors p-1"
          tabIndex={-1}
        >
          <EyeIcon visible={visible} />
        </button>
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const registered = searchParams.get("registered");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales inválidas. Verifica tu email y contraseña.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-8 shadow-inner-glow">
      <h2 className="text-2xl font-bold text-white mb-1">Iniciar Sesión</h2>
      <p className="text-metal-400 text-sm mb-6">Accede a tu cuenta para gestionar tus servicios</p>

      {registered && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-400">Cuenta creada exitosamente. Ahora puedes iniciar sesión.</p>
        </div>
      )}

      {error && (
        <div className="bg-error-subtle border border-error/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

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
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Iniciar Sesión
        </Button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <Link href="/recuperar" className="text-sm text-accent hover:text-accent-light transition-colors">
          ¿Olvidaste tu contraseña?
        </Link>
        <p className="text-sm text-metal-500">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-accent hover:text-accent-light transition-colors font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex bg-black">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface">
        {/* Grid/Circuit pattern */}
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
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
        {/* Circuit node dots */}
        <div className="absolute inset-0 opacity-[0.12]">
          <div className="absolute top-[20%] left-[30%] w-1.5 h-1.5 bg-accent rounded-full" />
          <div className="absolute top-[40%] left-[60%] w-1 h-1 bg-accent-light rounded-full" />
          <div className="absolute top-[65%] left-[25%] w-1 h-1 bg-accent rounded-full" />
          <div className="absolute top-[80%] left-[70%] w-1.5 h-1.5 bg-accent-light rounded-full" />
          <div className="absolute top-[35%] left-[80%] w-1 h-1 bg-accent rounded-full" />
          <div className="absolute top-[55%] left-[45%] w-1 h-1 bg-accent-light rounded-full" />
          <div className="absolute top-[15%] left-[75%] w-1 h-1 bg-accent rounded-full" />
          <div className="absolute top-[70%] left-[55%] w-1.5 h-1.5 bg-accent-light rounded-full" />
        </div>
        {/* Horizontal circuit lines */}
        <div className="absolute top-[20%] left-[30%] w-[30%] h-px bg-accent/10" />
        <div className="absolute top-[65%] left-[25%] w-[30%] h-px bg-accent/10" />
        <div className="absolute top-[80%] left-[55%] w-[25%] h-px bg-accent/10" />

        {/* Content */}
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
          <div className="space-y-4 text-metal-400">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-accent rounded-full shadow-glow" />
              <span>Gestión profesional de servicios</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-accent rounded-full shadow-glow" />
              <span>Control total de citas y clientes</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-accent rounded-full shadow-glow" />
              <span>Panel administrativo completo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-black p-6">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mx-auto mb-3 shadow-glow">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Innovar Security</h2>
          </div>

          <Suspense fallback={<div className="text-center text-metal-400 py-8">Cargando...</div>}>
            <LoginForm />
          </Suspense>

          <p className="text-center text-xs text-metal-600 mt-6">
            Protección profesional para tu hogar o negocio
          </p>
        </div>
      </div>
    </main>
  );
}
