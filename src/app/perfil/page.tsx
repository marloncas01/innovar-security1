"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardHeader, CardContent } from "@/components/ui";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  client?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    identification: string | null;
    address: string | null;
    city: string | null;
    municipality: string | null;
    department: string | null;
    zipCode: string | null;
  } | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          setProfile(data);
          setName(data.name || "");
          setPhone(data.phone || "");
          setLoading(false);
        })
        .catch(() => {
          setError("Error al cargar el perfil");
          setLoading(false);
        });
    }
  }, [status]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al actualizar");
        return;
      }

      setProfile((prev) => prev ? { ...prev, name: data.user.name, phone: data.user.phone } : null);
      setMessage("Perfil actualizado exitosamente");
    } catch {
      setError("Error al conectar con el servidor");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword) {
      setPasswordError("Todos los campos son requeridos");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Error al cambiar contraseña");
        return;
      }

      setPasswordMessage("Contraseña actualizada exitosamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Error al conectar con el servidor");
    } finally {
      setChangingPassword(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-metal-400">Cargando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-400">Error al cargar el perfil</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
        <p className="text-metal-400 text-sm mt-1">Gestiona tu información personal</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Información Personal</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {message && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-sm text-green-400">{message}</p>
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Input
              label="Nombre Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Correo Electrónico"
              value={profile.email}
              disabled
              hint="El correo electrónico está vinculado a tu cuenta"
            />
            <Input
              label="Teléfono de Contacto"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 3044451436"
            />
            <div>
              <label className="block text-sm font-medium text-metal-300 mb-1">
                Tipo de Cuenta / Rol
              </label>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  profile.role === "ADMIN" 
                    ? "bg-accent/20 text-accent border border-accent/30" 
                    : "bg-metal-800 text-metal-300 border border-metal-700"
                }`}>
                  {profile.role === "ADMIN" ? "👑 Administrador del Sistema" : "👤 Cliente Registrado"}
                </span>
                {profile.role === "ADMIN" && (
                  <span className="text-xs text-metal-400">
                    (Tienes acceso a todo el panel de administración y personalizaciones)
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={saving}>
                Guardar cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Admin Quick Link */}
      {profile.role === "ADMIN" && (
        <div className="bg-gradient-to-r from-accent/20 to-metal-900 border border-accent/40 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2">
              <span>⚙️</span> Personalización y Configuración de Negocio
            </h3>
            <p className="text-metal-400 text-xs mt-1">
              Modifica los números de contacto, cuentas de Nequi / Bancolombia, servicios, precios y políticas.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => router.push("/admin/configuracion")}
            className="shrink-0"
          >
            Ir a Configuración →
          </Button>
        </div>
      )}

      {profile.client && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Dirección y Datos para Citas</h2>
                <p className="text-xs text-metal-400">Estos datos se usan para coordinar las visitas técnicas en tu domicilio o negocio.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-metal-400 mb-1">Cédula / NIT</label>
                <input
                  type="text"
                  value={profile.client.identification || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProfile((prev) => prev ? {
                      ...prev,
                      client: prev.client ? { ...prev.client, identification: val } : null,
                    } : null);
                  }}
                  onBlur={async () => {
                    await fetch("/api/profile", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name, phone, identification: profile.client?.identification }),
                    });
                  }}
                  placeholder="Número de documento"
                  className="w-full bg-metal-900 border border-metal-700 rounded-lg px-3 py-2 text-sm text-white focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-metal-400 mb-1">Dirección habitual</label>
                <input
                  type="text"
                  value={profile.client.address || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProfile((prev) => prev ? {
                      ...prev,
                      client: prev.client ? { ...prev.client, address: val } : null,
                    } : null);
                  }}
                  onBlur={async () => {
                    await fetch("/api/profile", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name, phone, address: profile.client?.address }),
                    });
                  }}
                  placeholder="Ej: Carrera 5 # 10-25"
                  className="w-full bg-metal-900 border border-metal-700 rounded-lg px-3 py-2 text-sm text-white focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-metal-400 mb-1">Municipio / Ciudad</label>
                <input
                  type="text"
                  value={profile.client.municipality || profile.client.city || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProfile((prev) => prev ? {
                      ...prev,
                      client: prev.client ? { ...prev.client, municipality: val, city: val } : null,
                    } : null);
                  }}
                  onBlur={async () => {
                    await fetch("/api/profile", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name, phone, municipality: profile.client?.municipality, city: profile.client?.city }),
                    });
                  }}
                  placeholder="Ej: Fómeque, Choachí, Bogotá..."
                  className="w-full bg-metal-900 border border-metal-700 rounded-lg px-3 py-2 text-sm text-white focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-metal-400 mb-1">Departamento</label>
                <input
                  type="text"
                  value={profile.client.department || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProfile((prev) => prev ? {
                      ...prev,
                      client: prev.client ? { ...prev.client, department: val } : null,
                    } : null);
                  }}
                  onBlur={async () => {
                    await fetch("/api/profile", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name, phone, department: profile.client?.department }),
                    });
                  }}
                  placeholder="Ej: Cundinamarca"
                  className="w-full bg-metal-900 border border-metal-700 rounded-lg px-3 py-2 text-sm text-white focus:border-accent"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Cambiar Contraseña</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordMessage && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-sm text-green-400">{passwordMessage}</p>
              </div>
            )}
            {passwordError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-400">{passwordError}</p>
              </div>
            )}

            <Input
              label="Contraseña actual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Input
              label="Nueva contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              autoComplete="new-password"
            />
            <Input
              label="Confirmar nueva contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <div className="flex justify-end">
              <Button type="submit" loading={changingPassword}>
                Cambiar contraseña
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
