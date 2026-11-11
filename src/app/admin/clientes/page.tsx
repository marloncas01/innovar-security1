"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/layout/AdminLayout";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  createdAt: string;
  _count: { appointments: number; quotes: number };
}

export default function AdminClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);

    fetch(`/api/admin/clients?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setClients(data.clients || []);
        setTotalPages(data.pagination?.pages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, page]);

  return (
    <AdminLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-metal-400 mt-1">Gestiona los clientes del sistema</p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full max-w-md px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-white placeholder-metal-500 text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
            <svg className="w-12 h-12 text-metal-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="text-metal-400 font-medium">No hay clientes</p>
            <p className="text-metal-500 text-sm mt-1">Los clientes aparecerán aquí cuando se registren.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Nombre</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Teléfono</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Citas</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Cotizaciones</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-[var(--color-border)] hover:bg-white/5"
                    >
                      <td className="px-4 py-3">
                        <Link href={`/admin/clientes/${client.id}`} className="text-white font-medium hover:text-accent transition-colors">
                          {client.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-metal-300">{client.email || "—"}</td>
                      <td className="px-4 py-3 text-metal-300">{client.phone}</td>
                      <td className="px-4 py-3 text-metal-300">{client._count.appointments}</td>
                      <td className="px-4 py-3 text-metal-300">{client._count.quotes}</td>
                      <td className="px-4 py-3 text-metal-300 text-sm">
                        {new Date(client.createdAt).toLocaleDateString("es-CO")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {clients.map((client) => (
                <Link
                  key={client.id}
                  href={`/admin/clientes/${client.id}`}
                  className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 hover:border-accent/50 transition-colors"
                >
                  <p className="text-white font-medium mb-1">{client.name}</p>
                  <p className="text-metal-300 text-sm mb-1">{client.phone}</p>
                  {client.email && <p className="text-metal-400 text-sm mb-2">{client.email}</p>}
                  <div className="flex items-center gap-4 text-xs text-metal-500">
                    <span>{client._count.appointments} citas</span>
                    <span>{client._count.quotes} cotizaciones</span>
                    <span>{new Date(client.createdAt).toLocaleDateString("es-CO")}</span>
                  </div>
                </Link>
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
