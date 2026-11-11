"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import StatusBadge from "@/components/ui/StatusBadge";

interface ContentSection {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  active: boolean;
  createdAt: string;
}

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero / Banner Principal",
  about: "Quiénes Somos",
  services: "Servicios",
  how_it_works: "Cómo Funciona",
  contact: "Contacto",
  footer: "Pie de Página",
};

export default function AdminContenidoPage() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ContentSection>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = () => {
    setLoading(true);
    fetch("/api/admin/content")
      .then((res) => res.json())
      .then((data) => {
        setSections(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const startEdit = (section: ContentSection) => {
    setEditingId(section.id);
    setEditForm({ ...section });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editForm.section) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setSections((prev) => {
          const idx = prev.findIndex((s) => s.id === updated.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updated;
            return next;
          }
          return [...prev, updated];
        });
        cancelEdit();
      }
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (section: ContentSection) => {
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...section, active: !section.active }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSections((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
      }
    } catch (error) {
      console.error("Error toggling content:", error);
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Contenido</h1>
            <p className="text-metal-400 mt-1">
              Gestiona las secciones de contenido del sitio web
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : sections.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
            <p className="text-metal-400 font-medium">No hay secciones de contenido</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden"
              >
                {editingId === section.id ? (
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold">
                        Editar: {SECTION_LABELS[section.section] || section.section}
                      </h3>
                      <button onClick={cancelEdit} className="text-metal-400 hover:text-white text-sm">
                        Cancelar
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-metal-400 mb-1">Título</label>
                        <input
                          type="text"
                          value={editForm.title || ""}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-metal-400 mb-1">Subtítulo</label>
                        <input
                          type="text"
                          value={editForm.subtitle || ""}
                          onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                          className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-metal-400 mb-1">Descripción</label>
                        <textarea
                          rows={3}
                          value={editForm.description || ""}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-metal-400 mb-1">URL de imagen</label>
                        <input
                          type="text"
                          value={editForm.imageUrl || ""}
                          onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-metal-400 mb-1">Texto del botón</label>
                        <input
                          type="text"
                          value={editForm.buttonText || ""}
                          onChange={(e) => setEditForm({ ...editForm, buttonText: e.target.value })}
                          className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-metal-400 mb-1">URL del botón</label>
                        <input
                          type="text"
                          value={editForm.buttonUrl || ""}
                          onChange={(e) => setEditForm({ ...editForm, buttonUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-metal-400 mb-1">SEO Título</label>
                        <input
                          type="text"
                          value={editForm.seoTitle || ""}
                          onChange={(e) => setEditForm({ ...editForm, seoTitle: e.target.value })}
                          className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-metal-400 mb-1">SEO Descripción</label>
                        <textarea
                          rows={2}
                          value={editForm.seoDescription || ""}
                          onChange={(e) => setEditForm({ ...editForm, seoDescription: e.target.value })}
                          className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent resize-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 text-sm text-metal-400 hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="px-4 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        {saving ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">
                          {SECTION_LABELS[section.section] || section.section}
                        </h3>
                        <StatusBadge status={section.active ? "ACTIVE" : "INACTIVE"} />
                      </div>
                      {section.title && (
                        <p className="text-metal-300 text-sm mb-1">{section.title}</p>
                      )}
                      {section.description && (
                        <p className="text-metal-500 text-sm line-clamp-2">
                          {section.description.substring(0, 120)}
                          {section.description.length > 120 ? "..." : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleActive(section)}
                        className={`text-sm ${section.active ? "text-amber-400 hover:text-amber-300" : "text-green-400 hover:text-green-300"}`}
                      >
                        {section.active ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => startEdit(section)}
                        className="text-accent hover:text-accent-light text-sm"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
