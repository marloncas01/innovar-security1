"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/layout/AdminLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: string | null;
  status: string;
  reference: string | null;
  transactionId: string | null;
  notes: string | null;
  paidAt: string | null;
  createdAt: string;
  appointment: {
    id: string;
    scheduledDate: string;
    startTime: string;
    client: { name: string; phone: string };
    service: { name: string };
  };
}

const STATUS_FILTERS = [
  { key: "", label: "Todas" },
  { key: "PROCESSING", label: "Por Verificar" },
  { key: "PAID", label: "Confirmadas / Pagadas" },
  { key: "PENDING", label: "Sin Reportar" },
  { key: "FAILED", label: "Rechazadas" },
];

export default function AdminPagosPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PROCESSING");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const fetchPayments = () => {
    setLoading(true);
    fetch("/api/admin/payments?limit=100")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        setPayments(data?.payments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerify = async (paymentId: string, action: "CONFIRM" | "REJECT") => {
    const confirmPrompt = action === "CONFIRM"
      ? "¿Deseas aprobar este pago? La cita se marcará como CONFIRMADA automáticamente."
      : "¿Deseas rechazar este pago?";

    if (!confirm(confirmPrompt)) return;

    setVerifyingId(paymentId);
    setActionError("");

    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al procesar verificación");
      }

      fetchPayments();
    } catch (err: any) {
      setActionError(err.message || "Error al actualizar estado");
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredPayments = filter
    ? payments.filter((p) => p.status === filter)
    : payments;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Validación de Pagos y Transferencias</h1>
            <p className="text-metal-400 text-sm mt-1">
              Verifica los comprobantes de Nequi y Bancolombia enviados por los clientes para confirmar las citas.
            </p>
          </div>
        </div>

        {actionError && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-sm">
            {actionError}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
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
        ) : filteredPayments.length === 0 ? (
          <div className="bg-metal-900 border border-metal-700 rounded-xl p-12 text-center">
            <p className="text-metal-400">No hay pagos con el filtro seleccionado</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-metal-900 border border-metal-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-metal-700 text-metal-400 font-medium">
                    <th className="text-left px-4 py-3">Cliente</th>
                    <th className="text-left px-4 py-3">Cita / Servicio</th>
                    <th className="text-left px-4 py-3">Monto</th>
                    <th className="text-left px-4 py-3">Método</th>
                    <th className="text-left px-4 py-3">Referencia / Comprobante</th>
                    <th className="text-left px-4 py-3">Estado</th>
                    <th className="text-right px-4 py-3">Acciones de Verificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-metal-800">
                  {filteredPayments.map((p) => {
                    // Detectar si hay comprobante adjunto en las notas
                    const receiptMatch = p.notes?.match(/Comprobante:\s*([^\s]+)/);
                    const receiptUrl = receiptMatch ? receiptMatch[1] : null;

                    return (
                      <tr key={p.id} className="hover:bg-metal-800/50">
                        <td className="px-4 py-3">
                          <p className="text-white font-medium">{p.appointment?.client?.name || "—"}</p>
                          <p className="text-metal-500 text-xs">{p.appointment?.client?.phone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/citas/${p.appointment?.id}`}
                            className="text-accent hover:text-accent-light text-sm font-medium"
                          >
                            {p.appointment?.service?.name || "Ver cita"}
                          </Link>
                          <p className="text-metal-500 text-xs">
                            {new Date(p.appointment?.scheduledDate).toLocaleDateString("es-CO")}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-white font-bold">
                          ${p.amount.toLocaleString("es-CO")} {p.currency}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            p.method === "NEQUI"
                              ? "bg-fuchsia-950 border border-fuchsia-700 text-fuchsia-300"
                              : p.method === "BANCOLOMBIA"
                              ? "bg-yellow-950 border border-yellow-700 text-yellow-300"
                              : "bg-metal-800 text-metal-300"
                          }`}>
                            {p.method || "Transferencia"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs text-white">{p.reference || "Sin referencia"}</p>
                          {receiptUrl ? (
                            <a
                              href={receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 mt-1"
                            >
                              📎 Ver comprobante ↗
                            </a>
                          ) : p.notes ? (
                            <p className="text-xs text-metal-400 mt-0.5 line-clamp-1">{p.notes}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {p.status === "PROCESSING" || p.status === "PENDING" ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleVerify(p.id, "CONFIRM")}
                                loading={verifyingId === p.id}
                              >
                                Confirmar Pago ✓
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleVerify(p.id, "REJECT")}
                                loading={verifyingId === p.id}
                              >
                                Rechazar ✕
                              </Button>
                            </div>
                          ) : p.status === "PAID" ? (
                            <span className="text-xs text-emerald-400 font-medium">✓ Aprobado</span>
                          ) : (
                            <span className="text-xs text-red-400 font-medium">Rechazado</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filteredPayments.map((p) => {
                const receiptMatch = p.notes?.match(/Comprobante:\s*([^\s]+)/);
                const receiptUrl = receiptMatch ? receiptMatch[1] : null;

                return (
                  <div key={p.id} className="bg-metal-900 border border-metal-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-semibold">{p.appointment?.client?.name || "—"}</p>
                        <p className="text-metal-400 text-xs">{p.appointment?.service?.name}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-accent font-bold text-base">
                        ${p.amount.toLocaleString("es-CO")} COP
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-metal-800 text-white font-medium">
                        {p.method || "Transferencia"}
                      </span>
                    </div>

                    <div className="text-xs text-metal-400 bg-metal-800/60 p-2.5 rounded-lg space-y-1">
                      <p><span className="text-metal-500">Ref:</span> <span className="font-mono text-white">{p.reference || "N/A"}</span></p>
                      {receiptUrl && (
                        <a
                          href={receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline block pt-1"
                        >
                          📎 Ver imagen del comprobante ↗
                        </a>
                      )}
                    </div>

                    {(p.status === "PROCESSING" || p.status === "PENDING") && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleVerify(p.id, "CONFIRM")}
                          loading={verifyingId === p.id}
                        >
                          Confirmar ✓
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleVerify(p.id, "REJECT")}
                          loading={verifyingId === p.id}
                        >
                          Rechazar ✕
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
