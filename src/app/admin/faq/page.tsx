"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import StatusBadge from "@/components/ui/StatusBadge";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  active: boolean;
  sortOrder: number;
}

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editForm, setEditForm] = useState<Partial<FAQ>>({
    question: "",
    answer: "",
    category: "",
    active: true,
    sortOrder: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = () => {
    setLoading(true);
    fetch("/api/admin/faq")
      .then((res) => res.json())
      .then((data) => {
        setFaqs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const startCreate = () => {
    setEditingId(null);
    setEditForm({ question: "", answer: "", category: "", active: true, sortOrder: faqs.length });
    setShowForm(true);
  };

  const startEdit = (faq: FAQ) => {
    setShowForm(false);
    setEditingId(faq.id);
    setEditForm({ ...faq });
  };

  const cancelForm = () => {
    setEditingId(null);
    setShowForm(false);
    setEditForm({ question: "", answer: "", category: "", active: true, sortOrder: 0 });
  };

  const saveFaq = async () => {
    if (!editForm.question || !editForm.answer) return;
    setSaving(true);

    try {
      const isEdit = !!editingId;
      const url = isEdit ? `/api/admin/faq/${editingId}` : "/api/admin/faq";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const saved = await res.json();
        if (isEdit) {
          setFaqs((prev) => prev.map((f) => (f.id === saved.id ? saved : f)));
        } else {
          setFaqs((prev) => [...prev, saved]);
        }
        cancelForm();
      }
    } catch (error) {
      console.error("Error saving FAQ:", error);
    } finally {
      setSaving(false);
    }
  };

  const deleteFaq = async (faq: FAQ) => {
    if (!confirm(`¿Eliminar esta pregunta?`)) return;
    try {
      const res = await fetch(`/api/admin/faq/${faq.id}`, { method: "DELETE" });
      if (res.ok) {
        setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    }
  };

  const toggleActive = async (faq: FAQ) => {
    try {
      const res = await fetch(`/api/admin/faq/${faq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !faq.active }),
      });
      if (res.ok) {
        const updated = await res.json();
        setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      }
    } catch (error) {
      console.error("Error toggling FAQ:", error);
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">FAQ</h1>
            <p className="text-metal-400 mt-1">
              Gestiona las preguntas frecuentes del sitio web
            </p>
          </div>
          <button
            onClick={startCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva FAQ
          </button>
        </div>

        {/* Create/Edit form */}
        {(showForm || editingId) && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 mb-6">
            <h3 className="text-white font-semibold mb-4">
              {editingId ? "Editar Pregunta" : "Nueva Pregunta"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-metal-400 mb-1">Pregunta</label>
                <input
                  type="text"
                  value={editForm.question || ""}
                  onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                  className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                  placeholder="¿Qué preguntas hacen los clientes?"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-metal-400 mb-1">Respuesta</label>
                <textarea
                  rows={3}
                  value={editForm.answer || ""}
                  onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                  className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent resize-none"
                  placeholder="Respuesta completa..."
                />
              </div>
              <div>
                <label className="block text-sm text-metal-400 mb-1">Categoría</label>
                <input
                  type="text"
                  value={editForm.category || ""}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                  placeholder="general, servicios, pagos..."
                />
              </div>
              <div>
                <label className="block text-sm text-metal-400 mb-1">Orden</label>
                <input
                  type="number"
                  value={editForm.sortOrder || 0}
                  onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={cancelForm}
                className="px-4 py-2 text-sm text-metal-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveFaq}
                disabled={saving || !editForm.question || !editForm.answer}
                className="px-4 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
            <svg className="w-12 h-12 text-metal-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            <p className="text-metal-400 font-medium">No hay preguntas frecuentes</p>
            <p className="text-metal-500 text-sm mt-1">Crea la primera pregunta frecuente.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Orden</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Pregunta</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Respuesta</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Categoría</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.map((faq) => (
                    <tr key={faq.id} className="border-b border-[var(--color-border)] hover:bg-white/5">
                      <td className="px-4 py-3 text-metal-300">{faq.sortOrder}</td>
                      <td className="px-4 py-3 text-white max-w-xs truncate">{faq.question}</td>
                      <td className="px-4 py-3 text-metal-300 max-w-xs truncate">{faq.answer.substring(0, 60)}...</td>
                      <td className="px-4 py-3 text-metal-300">{faq.category || "—"}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={faq.active ? "ACTIVE" : "INACTIVE"} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(faq)}
                            className="text-accent hover:text-accent-light text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => toggleActive(faq)}
                            className={`text-sm ${faq.active ? "text-amber-400 hover:text-amber-300" : "text-green-400 hover:text-green-300"}`}
                          >
                            {faq.active ? "Desactivar" : "Activar"}
                          </button>
                          <button
                            onClick={() => deleteFaq(faq)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-medium text-sm flex-1 pr-2">{faq.question}</p>
                    <StatusBadge status={faq.active ? "ACTIVE" : "INACTIVE"} />
                  </div>
                  <p className="text-metal-400 text-xs mb-1 line-clamp-2">{faq.answer}</p>
                  <div className="flex items-center gap-3 text-xs text-metal-500 mb-3">
                    {faq.category && <span>{faq.category}</span>}
                    <span>Orden: {faq.sortOrder}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => startEdit(faq)} className="text-accent text-sm">Editar</button>
                    <button
                      onClick={() => toggleActive(faq)}
                      className={`text-sm ${faq.active ? "text-amber-400" : "text-green-400"}`}
                    >
                      {faq.active ? "Desactivar" : "Activar"}
                    </button>
                    <button onClick={() => deleteFaq(faq)} className="text-red-400 text-sm">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
