"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/layout/AdminLayout";
import StatusBadge from "@/components/ui/StatusBadge";

interface Appointment {
  id: string;
  status: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  locationAddress: string;
  createdAt: string;
  service: { name: string };
  client: { name: string; phone: string; email: string };
}

const STATUS_FILTERS = [
  { key: "", label: "Todas" },
  { key: "PENDING", label: "Pendientes" },
  { key: "CONFIRMED", label: "Confirmadas" },
  { key: "REPROGRAM_REQUESTED", label: "Reprogramación" },
  { key: "COMPLETED", label: "Completadas" },
  { key: "CANCELLED", label: "Canceladas" },
];

export default function AdminCitasPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (filter) params.set("status", filter);

    fetch(`/api/admin/citas?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data.appointments || []);
        setTotalPages(data.pagination?.pages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter, page]);

  return (
    <AdminLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Gestión de Citas</h1>
          <p className="text-metal-400 mt-1">Administra todas las citas del sistema</p>
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
                  : "bg-metal-800 text-metal-400 hover:text-white"
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
        ) : appointments.length === 0 ? (
          <div className="bg-metal-900 border border-metal-700 rounded-xl p-12 text-center">
            <p className="text-metal-400">No hay citas para mostrar</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-metal-900 border border-metal-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-metal-700">
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Cliente</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Servicio</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Fecha</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Hora</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr
                      key={apt.id}
                      className="border-b border-metal-800 hover:bg-metal-800/50"
                    >
                      <td className="px-4 py-3">
                        <p className="text-white">{apt.client.name}</p>
                        <p className="text-metal-500 text-xs">{apt.client.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-metal-300">{apt.service.name}</td>
                      <td className="px-4 py-3 text-metal-300">{apt.scheduledDate}</td>
                      <td className="px-4 py-3 text-metal-300">{apt.startTime}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={apt.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/citas/${apt.id}`}
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
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-metal-900 border border-metal-700 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-medium">{apt.client.name}</p>
                    <StatusBadge status={apt.status} />
                  </div>
                  <p className="text-metal-300 text-sm mb-1">{apt.service.name}</p>
                  <div className="flex items-center gap-3 text-metal-400 text-xs mb-3">
                    <span>{apt.scheduledDate}</span>
                    <span>{apt.startTime}</span>
                  </div>
                  <Link
                    href={`/admin/citas/${apt.id}`}
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
                  className="px-3 py-1.5 rounded-lg text-sm bg-metal-800 text-metal-400 hover:text-white disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1.5 text-sm text-metal-400">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm bg-metal-800 text-metal-400 hover:text-white disabled:opacity-50"
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
