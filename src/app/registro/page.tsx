"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpSchema } from "@/lib/validators";
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
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-metal-200">
        {label}
        <span className="text-red-400 ml-1">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          minLength={6}
          maxLength={72}
          autoComplete={autoComplete}
          className={`w-full h-10 px-3 pr-10 bg-metal-900 border rounded-lg text-white placeholder-metal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-metal-700 focus:ring-accent focus:border-accent"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-metal-400 hover:text-metal-200 transition-colors p-1"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          <EyeIcon visible={visible} />
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) newErrors[String(issue.path[0])] = issue.message;
    }
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    if (!acceptedTerms) { setServerError("Debes aceptar los términos y autorizar el tratamiento de tus datos para crear tu cuenta."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          acceptedTerms,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Error al crear la cuenta");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setServerError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <main className="min-h-screen flex bg-black">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface">
        {/* Grid pattern */}
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
        {/* Circuit lines */}
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
            <h2 className="text-2xl font-bold text-white mb-1">Crear Cuenta</h2>
            <p className="text-metal-400 text-sm mb-6">Regístrate para solicitar servicios</p>

            {serverError && (
              <div className="bg-error-subtle border border-error/20 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-400">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                autoComplete="name"
                maxLength={100}
                label="Nombre completo"
                placeholder="Tu nombre"
                value={form.name}
                onChange={handleChange("name")}
                error={errors.name}
                required
              />
              <Input
                autoComplete="email"
                maxLength={254}
                label="Email"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange("email")}
                error={errors.email}
                required
              />
              <Input
                autoComplete="tel"
                maxLength={25}
                label="Teléfono"
                type="tel"
                placeholder="300 123 4567"
                value={form.phone}
                onChange={handleChange("phone")}
                error={errors.phone}
                required
              />
              <PasswordInput
                id="password"
                label="Contraseña"
                value={form.password}
                onChange={handleChange("password")}
                placeholder="Mínimo 6 caracteres"
                error={errors.password}
                autoComplete="new-password"
              />
              <PasswordInput
                id="confirmPassword"
                label="Confirmar contraseña"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                placeholder="Repite tu contraseña"
                error={errors.confirmPassword}
                autoComplete="new-password"
              />

              <div className="flex items-start gap-3 text-sm text-metal-300">
                <input id="acceptedTerms" type="checkbox" required checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 accent-blue-600" />
                <label htmlFor="acceptedTerms">Acepto los <Link href="/terminos" target="_blank" className="text-accent underline">Términos y Condiciones</Link> y autorizo el tratamiento de mis datos según la <Link href="/privacidad" target="_blank" className="text-accent underline">Política de Privacidad</Link>.</label>
              </div>
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Crear Cuenta
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-metal-500">
              ¿Ya tienes cuenta?{" "}
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
