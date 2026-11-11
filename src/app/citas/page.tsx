"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui";

interface Appointment {
  id: string;
  status: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  locationAddress: string;
  service: { name: string; slug: string };
}

const FILTERS = [
  { value: "", label: "Todas" },
  { value: "PENDING", label: "Pendientes" },
  { value: "CONFIRMED", label: "Confirmadas" },
  { value: "COMPLETED", label: "Completadas" },
] as const;

export default function CitasPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter) params.set("status", filter);

    fetch(`/api/citas?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Mis Citas</h1>
            <p className="text-metal-400 mt-1">
              Gestiona tus servicios y citas programadas
            </p>
          </div>
          <Link
            href="/citas/nueva"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all text-sm shadow-lg shadow-emerald-900/30"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nueva Solicitud
          </Link>
        </div>

        <div className="flex gap-1 bg-metal-900 border border-[var(--color-border)] p-1 rounded-lg mb-6 max-w-md overflow-x-auto">
          {FILTERS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === tab.value
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-metal-400 hover:text-white hover:bg-metal-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-metal-400 mt-4 text-sm">Cargando citas...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-metal-900 border border-[var(--color-border)] rounded-xl p-14 text-center">
            <div className="w-16 h-16 bg-metal-800 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-8 h-8 text-metal-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No tienes citas programadas
            </h3>
            <p className="text-metal-400 text-sm mb-6 max-w-sm mx-auto">
              Aún no tienes citas. Solicita un servicio para comenzar.
            </p>
            <Link
              href="/citas/nueva"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all text-sm"
            >
              Solicitar Servicio
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <Link
                key={apt.id}
                href={`/citas/${apt.id}`}
                className="group block bg-metal-900 border border-[var(--color-border)] rounded-xl p-5 hover:border-metal-600 hover:bg-metal-900/80 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {apt.service.name}
                    </h3>
                    <p className="text-metal-400 text-sm mt-1">
                      {apt.scheduledDate} a las {apt.startTime}
                    </p>
                    <p className="text-metal-500 text-xs mt-1 truncate">
                      {apt.locationAddress}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusBadge status={apt.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
