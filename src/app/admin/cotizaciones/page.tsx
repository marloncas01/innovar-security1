"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/layout/AdminLayout";
import StatusBadge from "@/components/ui/StatusBadge";

interface Quote {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  sentAt: string | null;
  client: { name: string; phone: string };
  appointment: {
    scheduledDate: string;
    service: { name: string };
  };
}

const STATUS_FILTERS = [
  { key: "", label: "Todas" },
  { key: "DRAFT", label: "Borrador" },
  { key: "SENT", label: "Enviadas" },
  { key: "ACCEPTED", label: "Aceptadas" },
  { key: "REJECTED", label: "Rechazadas" },
];

export default function AdminCotizacionesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (filter) params.set("status", filter);

    fetch(`/api/admin/quotes?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setQuotes(data.quotes || []);
        setTotalPages(data.pagination?.pages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter, page]);

  const formatCOP = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <AdminLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Cotizaciones</h1>
          <p className="text-metal-400 mt-1">
            Gestiona las cotizaciones para clientes
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.key}
              onClick={() => {
                setFilter(s.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === s.key
                  ? "bg-accent text-white"
                  : "bg-metal-800 text-metal-400 hover:text-white border border-metal-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
            <p className="text-metal-400">No hay cotizaciones</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">
                      Cliente
                    </th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">
                      Cita
                    </th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">
                      Total
                    </th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">
                      Estado
                    </th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">
                      Fecha
                    </th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => (
                    <tr
                      key={q.id}
                      className="border-b border-[var(--color-border)] hover:bg-white/5"
                    >
                      <td className="px-4 py-3">
                        <p className="text-white">{q.client?.name || "—"}</p>
                        <p className="text-metal-500 text-xs">
                          {q.client?.phone}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-metal-300">
                        {q.appointment?.service?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-white font-medium">
                        {formatCOP(q.total)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="px-4 py-3 text-metal-300 text-sm">
                        {new Date(q.createdAt).toLocaleDateString("es-CO")}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/cotizaciones/${q.id}`}
                          className="text-accent hover:text-accent-light text-sm"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {quotes.map((q) => (
                <div
                  key={q.id}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-medium">
                      {q.client?.name || "—"}
                    </p>
                    <StatusBadge status={q.status} />
                  </div>
                  <p className="text-metal-300 text-sm mb-1">
                    {q.appointment?.service?.name || "—"}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">
                      {formatCOP(q.total)}
                    </span>
                    <span className="text-metal-400 text-xs">
                      {new Date(q.createdAt).toLocaleDateString("es-CO")}
                    </span>
                  </div>
                  <Link
                    href={`/admin/cotizaciones/${q.id}`}
                    className="text-accent hover:text-accent-light text-sm"
                  >
                    Ver
                  </Link>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-metal-400 hover:text-white disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1.5 text-sm text-metal-400">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-metal-400 hover:text-white disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
