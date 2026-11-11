"use client";

import { useState, useEffect } from "react";

interface Zone {
  id: string;
  name: string;
  municipality: string | null;
  department: string | null;
  baseDistance: number | null;
  ratePerKm: number | null;
  flatRate: number | null;
  notes: string | null;
  active: boolean;
}

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function AdminZonasPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    municipality: "",
    department: "",
    baseDistance: "",
    ratePerKm: "",
    flatRate: "",
    notes: "",
    active: true,
  });

  const fetchZones = () => {
    setLoading(true);
    fetch("/api/admin/zones")
      .then((res) => res.json())
      .then((data) => {
        setZones(data.zones || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchZones(); }, []);

  const resetForm = () => {
    setForm({ name: "", municipality: "", department: "", baseDistance: "", ratePerKm: "", flatRate: "", notes: "", active: true });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (zone: Zone) => {
    setForm({
      name: zone.name,
      municipality: zone.municipality || "",
      department: zone.department || "",
      baseDistance: zone.baseDistance != null ? String(zone.baseDistance) : "",
      ratePerKm: zone.ratePerKm != null ? String(zone.ratePerKm) : "",
      flatRate: zone.flatRate != null ? String(zone.flatRate) : "",
      notes: zone.notes || "",
      active: zone.active,
    });
    setEditingId(zone.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const payload = {
      name: form.name.trim(),
      municipality: form.municipality.trim() || null,
      department: form.department.trim() || null,
      baseDistance: form.baseDistance !== "" ? Number(form.baseDistance) : null,
      ratePerKm: form.ratePerKm !== "" ? Number(form.ratePerKm) : null,
      flatRate: form.flatRate !== "" ? Number(form.flatRate) : null,
      notes: form.notes.trim() || null,
      active: form.active,
    };

    const url = editingId ? `/api/admin/zones/${editingId}` : "/api/admin/zones";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        resetForm();
        fetchZones();
      }
    } catch (error) {
      console.error("Error saving zone:", error);
    }
  };

  const deleteZone = async (id: string) => {
    if (!confirm("¿Eliminar esta zona?")) return;
    try {
      const res = await fetch(`/api/admin/zones/${id}`, { method: "DELETE" });
      if (res.ok) fetchZones();
    } catch (error) {
      console.error("Error deleting zone:", error);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Zonas de Desplazamiento</h1>
          <p className="text-metal-400 mt-1">
            Configura las tarifas de desplazamiento por zona
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Zona
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">{editingId ? "Editar Zona" : "Nueva Zona"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-metal-300 mb-1.5">Nombre *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent transition-colors" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300 mb-1.5">Municipio</label>
              <input type="text" value={form.municipality} onChange={(e) => setForm({ ...form, municipality: e.target.value })}
                className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300 mb-1.5">Departamento</label>
              <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300 mb-1.5">Distancia base (km)</label>
              <input type="number" value={form.baseDistance} onChange={(e) => setForm({ ...form, baseDistance: e.target.value })}
                className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent transition-colors" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300 mb-1.5">Tarifa por km (COP)</label>
              <input type="number" value={form.ratePerKm} onChange={(e) => setForm({ ...form, ratePerKm: e.target.value })}
                className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent transition-colors" min="0" step="100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300 mb-1.5">Tarifa fija (COP)</label>
              <input type="number" value={form.flatRate} onChange={(e) => setForm({ ...form, flatRate: e.target.value })}
                className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent transition-colors" min="0" step="1000" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-metal-300 mb-1.5">Notas</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent transition-colors" rows={2} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${form.active ? "bg-accent border-accent" : "border-metal-600"}`}
              onClick={() => setForm({ ...form, active: !form.active })}>
              {form.active && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className="text-sm text-metal-300">Activa</span>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-metal-400 hover:text-white text-sm">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg text-sm">{editingId ? "Guardar" : "Crear"}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : zones.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <p className="text-metal-400 font-medium">No hay zonas configuradas</p>
          <p className="text-metal-500 text-sm mt-1">Agrega zonas para calcular costos de desplazamiento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {zones.map((zone) => (
            <div key={zone.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium">{zone.name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-metal-400 mt-1">
                  {zone.municipality && <span>{zone.municipality}</span>}
                  {zone.department && <span>{zone.department}</span>}
                  {zone.flatRate != null && <span>Tarifa fija: {formatCOP(zone.flatRate)}</span>}
                  {zone.ratePerKm != null && <span>{formatCOP(zone.ratePerKm)}/km</span>}
                  {zone.baseDistance != null && <span>Base: {zone.baseDistance} km</span>}
                </div>
                {zone.notes && <p className="text-xs text-metal-500 mt-1">{zone.notes}</p>}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => startEdit(zone)} className="text-accent hover:text-accent-light text-sm">Editar</button>
                <button onClick={() => deleteZone(zone.id)} className="text-red-400 hover:text-red-300 text-sm">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
