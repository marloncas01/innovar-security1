"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import StatusBadge from "@/components/ui/StatusBadge";

interface ClientDetail {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  municipality: string | null;
  user: { email: string; active: boolean; createdAt: string };
  appointments: {
    id: string;
    status: string;
    scheduledDate: string;
    startTime: string;
    service: { name: string };
    payment: { status: string; amount: number } | null;
  }[];
  quotes: {
    id: string;
    status: string;
    total: number;
    createdAt: string;
  }[];
}

export default function AdminClienteDetailPage() {
  const params = useParams();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/admin/clients/${params.id}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        setClient(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const formatCOP = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <AdminLayout>
      <div>
        <div className="mb-6">
          <Link
            href="/admin/clientes"
            className="inline-flex items-center gap-1 text-sm text-metal-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Clientes
          </Link>
          <h1 className="text-2xl font-bold text-white">Detalle del Cliente</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : !client ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
            <p className="text-metal-400">Cliente no encontrado</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Client Info */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Información Personal</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-metal-500 text-sm mb-1">Nombre</p>
                  <p className="text-white">{client.name}</p>
                </div>
                <div>
                  <p className="text-metal-500 text-sm mb-1">Email</p>
                  <p className="text-white">{client.email || "—"}</p>
                </div>
                <div>
                  <p className="text-metal-500 text-sm mb-1">Teléfono</p>
                  <p className="text-white">{client.phone}</p>
                </div>
                <div>
                  <p className="text-metal-500 text-sm mb-1">Dirección</p>
                  <p className="text-white">{client.address || "—"}</p>
                </div>
                <div>
                  <p className="text-metal-500 text-sm mb-1">Municipio</p>
                  <p className="text-white">{client.municipality || "—"}</p>
                </div>
                <div>
                  <p className="text-metal-500 text-sm mb-1">Estado cuenta</p>
                  <StatusBadge status={client.user.active ? "ACTIVE" : "INACTIVE"} />
                </div>
              </div>
            </div>

            {/* Appointments */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Citas ({client.appointments.length})
              </h2>
              {client.appointments.length === 0 ? (
                <p className="text-metal-400 text-sm">No tiene citas registradas.</p>
              ) : (
                <div className="space-y-3">
                  {client.appointments.map((apt) => (
                    <Link
                      key={apt.id}
                      href={`/admin/citas/${apt.id}`}
                      className="flex items-center justify-between p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-white text-sm font-medium">{apt.service.name}</p>
                          <p className="text-metal-400 text-xs">
                            {apt.scheduledDate} • {apt.startTime}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={apt.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quotes */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Cotizaciones ({client.quotes.length})
              </h2>
              {client.quotes.length === 0 ? (
                <p className="text-metal-400 text-sm">No tiene cotizaciones registradas.</p>
              ) : (
                <div className="space-y-3">
                  {client.quotes.map((quote) => (
                    <Link
                      key={quote.id}
                      href={`/admin/cotizaciones/${quote.id}`}
                      className="flex items-center justify-between p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-accent/50 transition-colors"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">{formatCOP(quote.total)}</p>
                        <p className="text-metal-400 text-xs">
                          {new Date(quote.createdAt).toLocaleDateString("es-CO")}
                        </p>
                      </div>
                      <StatusBadge status={quote.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
