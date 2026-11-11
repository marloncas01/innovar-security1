"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import StatusBadge from "@/components/ui/StatusBadge";

interface ChatbotMessage {
  id: string;
  type: string;
  question: string | null;
  answer: string;
  options: string;
  actionUrl: string | null;
  sortOrder: number;
  active: boolean;
}

export default function AdminChatbotPage() {
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ChatbotMessage>>({
    type: "QUESTION",
    question: "",
    answer: "",
    actionUrl: "",
    sortOrder: 0,
    active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = () => {
    setLoading(true);
    fetch("/api/admin/chatbot")
      .then((res) => res.json())
      .then((data) => {
        setMessages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const startCreate = () => {
    setEditingId(null);
    setEditForm({
      type: "QUESTION",
      question: "",
      answer: "",
      actionUrl: "",
      sortOrder: messages.length,
      active: true,
    });
    setShowForm(true);
  };

  const startEdit = (msg: ChatbotMessage) => {
    setShowForm(false);
    setEditingId(msg.id);
    setEditForm({ ...msg });
  };

  const cancelForm = () => {
    setEditingId(null);
    setShowForm(false);
    setEditForm({ type: "QUESTION", question: "", answer: "", actionUrl: "", sortOrder: 0, active: true });
  };

  const saveMessage = async () => {
    if (!editForm.type || !editForm.answer) return;
    setSaving(true);

    try {
      const isEdit = !!editingId;
      const url = isEdit ? `/api/admin/chatbot/${editingId}` : "/api/admin/chatbot";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const saved = await res.json();
        if (isEdit) {
          setMessages((prev) => prev.map((m) => (m.id === saved.id ? saved : m)));
        } else {
          setMessages((prev) => [...prev, saved]);
        }
        cancelForm();
      }
    } catch (error) {
      console.error("Error saving message:", error);
    } finally {
      setSaving(false);
    }
  };

  const deleteMessage = async (msg: ChatbotMessage) => {
    if (!confirm("¿Eliminar este mensaje del chatbot?")) return;
    try {
      const res = await fetch(`/api/admin/chatbot/${msg.id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const toggleActive = async (msg: ChatbotMessage) => {
    try {
      const res = await fetch(`/api/admin/chatbot/${msg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !msg.active }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      }
    } catch (error) {
      console.error("Error toggling message:", error);
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Chatbot</h1>
            <p className="text-metal-400 mt-1">
              Gestiona las respuestas automáticas del chatbot
            </p>
          </div>
          <button
            onClick={startCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Mensaje
          </button>
        </div>

        {/* Create/Edit form */}
        {(showForm || editingId) && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 mb-6">
            <h3 className="text-white font-semibold mb-4">
              {editingId ? "Editar Mensaje" : "Nuevo Mensaje"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-metal-400 mb-1">Tipo</label>
                <select
                  value={editForm.type || "QUESTION"}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                >
                  <option value="QUESTION">Pregunta</option>
                  <option value="ANSWER">Respuesta</option>
                </select>
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
              {editForm.type === "QUESTION" && (
                <div className="sm:col-span-2">
                  <label className="block text-sm text-metal-400 mb-1">Pregunta</label>
                  <input
                    type="text"
                    value={editForm.question || ""}
                    onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                    className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                    placeholder="¿Qué pregunta responde?"
                  />
                </div>
              )}
              <div className="sm:col-span-2">
                <label className="block text-sm text-metal-400 mb-1">Respuesta</label>
                <textarea
                  rows={3}
                  value={editForm.answer || ""}
                  onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                  className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent resize-none"
                  placeholder="Respuesta del chatbot..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-metal-400 mb-1">URL de acción (opcional)</label>
                <input
                  type="text"
                  value={editForm.actionUrl || ""}
                  onChange={(e) => setEditForm({ ...editForm, actionUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                  placeholder="https://..."
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
                onClick={saveMessage}
                disabled={saving || !editForm.answer}
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
        ) : messages.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
            <svg className="w-12 h-12 text-metal-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-11.375-5.25h13.5a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5h-13.5a1.5 1.5 0 01-1.5-1.5v-10.5a1.5 1.5 0 011.5-1.5z" />
            </svg>
            <p className="text-metal-400 font-medium">No hay mensajes del chatbot</p>
            <p className="text-metal-500 text-sm mt-1">Crea el primer mensaje para el chatbot.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Tipo</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Pregunta</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Respuesta</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} className="border-b border-[var(--color-border)] hover:bg-white/5">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${msg.type === "QUESTION" ? "bg-blue-900/40 text-blue-300 border border-blue-700/50" : "bg-green-900/40 text-green-300 border border-green-700/50"}`}>
                          {msg.type === "QUESTION" ? "Pregunta" : "Respuesta"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white max-w-xs truncate">{msg.question || "—"}</td>
                      <td className="px-4 py-3 text-metal-300 max-w-xs truncate">{msg.answer.substring(0, 60)}...</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={msg.active ? "ACTIVE" : "INACTIVE"} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(msg)}
                            className="text-accent hover:text-accent-light text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => toggleActive(msg)}
                            className={`text-sm ${msg.active ? "text-amber-400 hover:text-amber-300" : "text-green-400 hover:text-green-300"}`}
                          >
                            {msg.active ? "Desactivar" : "Activar"}
                          </button>
                          <button
                            onClick={() => deleteMessage(msg)}
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
              {messages.map((msg) => (
                <div key={msg.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${msg.type === "QUESTION" ? "bg-blue-900/40 text-blue-300 border border-blue-700/50" : "bg-green-900/40 text-green-300 border border-green-700/50"}`}>
                      {msg.type === "QUESTION" ? "Pregunta" : "Respuesta"}
                    </span>
                    <StatusBadge status={msg.active ? "ACTIVE" : "INACTIVE"} />
                  </div>
                  {msg.question && <p className="text-white text-sm font-medium mb-1">{msg.question}</p>}
                  <p className="text-metal-400 text-xs mb-3 line-clamp-2">{msg.answer}</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => startEdit(msg)} className="text-accent text-sm">Editar</button>
                    <button
                      onClick={() => toggleActive(msg)}
                      className={`text-sm ${msg.active ? "text-amber-400" : "text-green-400"}`}
                    >
                      {msg.active ? "Desactivar" : "Activar"}
                    </button>
                    <button onClick={() => deleteMessage(msg)} className="text-red-400 text-sm">Eliminar</button>
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
