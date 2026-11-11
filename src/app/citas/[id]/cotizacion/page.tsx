"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui";

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Quote {
  id: string;
  status: string;
  items: QuoteItem[];
  subtotal: number;
  displacement: number;
  total: number;
  validUntil: string;
  observations?: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  service: { name: string };
  scheduledDate: string;
  client: { name: string; email: string };
}

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function CotizacionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [aptRes, quoteRes] = await Promise.all([
          fetch(`/api/citas/${id}`),
          fetch(`/api/citas/${id}/quote`),
        ]);

        if (!aptRes.ok) throw new Error("No se pudo cargar la cita");
        const aptData = await aptRes.json();
        setAppointment(aptData);

        if (quoteRes.ok) {
          const quoteData = await quoteRes.json();
          let items = quoteData.items;
          if (typeof items === "string") {
            try {
              items = JSON.parse(items);
            } catch {
              items = [];
            }
          }
          setQuote({ ...quoteData, items: Array.isArray(items) ? items : [] });
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function handleAccept() {
    if (!quote) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/client/quotes/${quote.id}/accept`, { method: "POST" });
      if (!res.ok) throw new Error("Error al aceptar la cotización");
      setQuote({ ...quote, status: "ACCEPTED" });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!quote) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/client/quotes/${quote.id}/reject`, { method: "POST" });
      if (!res.ok) throw new Error("Error al rechazar la cotización");
      setQuote({ ...quote, status: "REJECTED" });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <svg className="w-8 h-8 text-emerald-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-metal-300 text-lg">{error || "Cita no encontrada"}</p>
        <Link href="/citas" className="text-emerald-400 hover:text-emerald-300 transition-colors">
          Volver a citas
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={`/citas/${id}`}
          className="inline-flex items-center gap-2 text-metal-400 hover:text-white transition-colors mb-8 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la cita
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Cotización</h1>
            </div>
            <p className="text-metal-500 text-sm">
              {appointment.service?.name || "Servicio"} — {appointment.client?.name || "Cliente"}
            </p>
          </div>
          {quote && <StatusBadge status={quote.status} />}
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden mb-6">
          <div className="p-6 border-b border-[var(--color-border)]">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Innovar Security</h2>
                <p className="text-metal-500 text-sm">Cotización de servicios de seguridad</p>
              </div>
              <div className="text-right">
                <p className="text-metal-500 text-xs uppercase tracking-wider mb-1">Cotización</p>
                <p className="text-white font-mono text-sm">#{quote?.id?.slice(-8).toUpperCase() || "—"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 border-b border-[var(--color-border)]">
            <div>
              <p className="text-metal-500 text-xs uppercase tracking-wider mb-1">Cliente</p>
              <p className="text-white text-sm font-medium">{appointment.client?.name || "—"}</p>
            </div>
            <div>
              <p className="text-metal-500 text-xs uppercase tracking-wider mb-1">Fecha de la cita</p>
              <p className="text-white text-sm">
                {new Date(appointment.scheduledDate).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-metal-500 text-xs uppercase tracking-wider mb-1">Válido hasta</p>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-metal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-white text-sm">
                  {quote?.validUntil
                    ? new Date(quote.validUntil).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-metal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-xs font-semibold text-metal-500 uppercase tracking-wider">
                Detalle de items
              </h3>
            </div>

            {quote?.items && quote.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left text-xs font-medium text-metal-500 uppercase tracking-wider pb-3 pr-4">
                        Descripción
                      </th>
                      <th className="text-center text-xs font-medium text-metal-500 uppercase tracking-wider pb-3 px-4">
                        Cantidad
                      </th>
                      <th className="text-right text-xs font-medium text-metal-500 uppercase tracking-wider pb-3 px-4">
                        P. Unitario
                      </th>
                      <th className="text-right text-xs font-medium text-metal-500 uppercase tracking-wider pb-3 pl-4">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((item, idx) => (
                      <tr
                        key={item.id || idx}
                        className={`border-b border-[var(--color-border)]/50 ${idx % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                      >
                        <td className="py-3.5 pr-4 text-sm text-metal-200">{item.description}</td>
                        <td className="py-3.5 px-4 text-sm text-metal-400 text-center">{item.quantity}</td>
                        <td className="py-3.5 px-4 text-sm text-metal-400 text-right">
                          {formatCOP(item.unitPrice)}
                        </td>
                        <td className="py-3.5 pl-4 text-sm text-white font-medium text-right">
                          {formatCOP(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-10 h-10 text-metal-700 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-metal-500 text-sm">No hay items en esta cotización</p>
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            <div className="bg-metal-900/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-metal-400 text-sm">Subtotal</span>
                <span className="text-metal-200 text-sm font-medium">
                  {formatCOP(quote?.subtotal || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-metal-400 text-sm">Desplazamiento</span>
                <span className="text-metal-200 text-sm font-medium">
                  {formatCOP(quote?.displacement || 0)}
                </span>
              </div>
              <div className="h-px bg-metal-700" />
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Total</span>
                <span className="text-2xl font-bold text-white">
                  {formatCOP(quote?.total || 0)}
                </span>
              </div>
            </div>
          </div>

          {quote?.observations && (
            <div className="px-6 pb-6">
              <h3 className="text-xs font-semibold text-metal-500 uppercase tracking-wider mb-2">
                Observaciones
              </h3>
              <p className="text-metal-300 text-sm bg-metal-900/50 rounded-xl p-4 leading-relaxed">
                {quote.observations}
              </p>
            </div>
          )}
        </div>

        {quote?.status === "SENT" && (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAccept}
              disabled={actionLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {actionLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              Aceptar cotización
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="flex-1 bg-red-600/10 hover:bg-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 font-semibold py-3.5 px-6 rounded-xl border border-red-500/20 transition-colors flex items-center justify-center gap-2"
            >
              {actionLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              Rechazar cotización
            </button>
          </div>
        )}

        {quote?.status === "ACCEPTED" && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-emerald-400 text-sm font-medium">
              Cotización aceptada. El servicio está confirmado.
            </p>
          </div>
        )}

        {quote?.status === "REJECTED" && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <p className="text-red-400 text-sm font-medium">
              Cotización rechazada.
            </p>
          </div>
        )}

        <Link
          href={`/citas/${id}`}
          className="w-full block text-center bg-transparent border border-[var(--color-border)] hover:border-metal-600 text-metal-300 font-medium py-3.5 px-6 rounded-xl transition-colors mt-4"
        >
          Volver a la cita
        </Link>
      </div>
    </div>
  );
}
