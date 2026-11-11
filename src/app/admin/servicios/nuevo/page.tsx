"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoServicioPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    requiresVisit: false,
    active: true,
    sortOrder: "0",
    features: [""],
    exclusions: [""],
  });

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addFeature = () => updateField("features", [...form.features, ""]);
  const removeFeature = (i: number) => updateField("features", form.features.filter((_, idx) => idx !== i));
  const updateFeature = (i: number, val: string) => {
    const updated = [...form.features];
    updated[i] = val;
    updateField("features", updated);
  };

  const addExclusion = () => updateField("exclusions", [...form.exclusions, ""]);
  const removeExclusion = (i: number) => updateField("exclusions", form.exclusions.filter((_, idx) => idx !== i));
  const updateExclusion = (i: number, val: string) => {
    const updated = [...form.exclusions];
    updated[i] = val;
    updateField("exclusions", updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: form.price !== "" ? Number(form.price) : null,
          duration: form.duration !== "" ? Number(form.duration) : null,
          requiresVisit: form.requiresVisit,
          active: form.active,
          sortOrder: Number(form.sortOrder) || 0,
          features: form.features.filter((f) => f.trim()),
          exclusions: form.exclusions.filter((e) => e.trim()),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al crear servicio");
        return;
      }

      router.push("/admin/servicios");
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/servicios" className="text-accent hover:text-accent-light text-sm mb-3 inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Volver a servicios
        </Link>
        <h1 className="text-2xl font-bold text-white">Nuevo Servicio</h1>
        <p className="text-metal-400 mt-1">Crea un nuevo servicio para ofrecer a clientes</p>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Información básica</h2>

          <div>
            <label className="block text-sm font-medium text-metal-300 mb-1.5">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white placeholder-metal-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              placeholder="Ej: Instalación de Cámaras"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-metal-300 mb-1.5">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white placeholder-metal-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              placeholder="Describe el servicio..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-metal-300 mb-1.5">Precio (COP)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white placeholder-metal-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                placeholder="Dejar vacío = cotización"
                min="0"
                step="1000"
              />
              <p className="text-xs text-metal-500 mt-1">Dejar vacío si el precio requiere cotización</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300 mb-1.5">Duración (minutos)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => updateField("duration", e.target.value)}
                className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white placeholder-metal-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                placeholder="Ej: 120"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-metal-300 mb-1.5">Orden de aparición</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => updateField("sortOrder", e.target.value)}
                className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white placeholder-metal-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                min="0"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  form.requiresVisit ? "bg-accent border-accent" : "border-metal-600 bg-transparent"
                }`}
                onClick={() => updateField("requiresVisit", !form.requiresVisit)}
              >
                {form.requiresVisit && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-metal-300">Requiere visita técnica</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  form.active ? "bg-accent border-accent" : "border-metal-600 bg-transparent"
                }`}
                onClick={() => updateField("active", !form.active)}
              >
                {form.active && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-metal-300">Activo (visible para clientes)</span>
            </label>
          </div>
        </div>

        {/* Features */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Características</h2>
            <button type="button" onClick={addFeature} className="text-accent hover:text-accent-light text-sm">
              + Agregar
            </button>
          </div>
          <p className="text-xs text-metal-500">Lista de características que se muestran al cliente</p>
          {form.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(i, e.target.value)}
                className="flex-1 px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white placeholder-metal-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-sm"
                placeholder={`Característica ${i + 1}`}
              />
              {form.features.length > 1 && (
                <button type="button" onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-300 p-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Exclusions */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Exclusiones</h2>
            <button type="button" onClick={addExclusion} className="text-accent hover:text-accent-light text-sm">
              + Agregar
            </button>
          </div>
          <p className="text-xs text-metal-500">Qué NO incluye este servicio</p>
          {form.exclusions.map((exclusion, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={exclusion}
                onChange={(e) => updateExclusion(i, e.target.value)}
                className="flex-1 px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white placeholder-metal-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-sm"
                placeholder={`Exclusión ${i + 1}`}
              />
              {form.exclusions.length > 1 && (
                <button type="button" onClick={() => removeExclusion(i)} className="text-red-400 hover:text-red-300 p-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/servicios"
            className="px-4 py-2.5 text-metal-400 hover:text-white text-sm font-medium transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg transition-all text-sm disabled:opacity-50"
          >
            {saving ? "Creando..." : "Crear Servicio"}
          </button>
        </div>
      </form>
    </div>
  );
}
