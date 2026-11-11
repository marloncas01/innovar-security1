"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge } from "@/components/ui";
import { QUOTE_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";

interface QuoteDetail {
  id: string;
  items: string;
  subtotal: number;
  displacement: number | null;
  total: number;
  observations: string | null;
  status: string;
  sentAt: string | null;
  validUntil: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  client: { name: string; phone: string; email: string };
  appointment: { id: string; scheduledDate: string; startTime: string; locationAddress: string; service: { name: string } };
}

export default function AdminQuoteDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchQuote = () => {
    fetch(`/api/admin/quotes/${id}`)
      .then((res) => { if (!res.ok) throw new Error("No encontrada"); return res.json(); })
      .then((data) => { setQuote(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { fetchQuote(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/quotes/${id}/send`, { method: "POST" });
      if (res.ok) fetchQuote();
    } catch { setError("Error al enviar"); }
    setSubmitting(false);
  };

  const handleCancel = async () => {
    if (!confirm("¿Cancelar esta cotización?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/quotes/${id}/cancel`, { method: "POST" });
      if (res.ok) fetchQuote();
    } catch { setError("Error al cancelar"); }
    setSubmitting(false);
  };

  if (loading) return <div className="text-center py-16"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  if (error || !quote) return <div className="text-center py-16"><p className="text-red-400">{error || "No encontrada"}</p><Button variant="outline" className="mt-4" onClick={() => router.push("/admin/cotizaciones")}>Volver</Button></div>;

  let items: any[] = [];
  try { items = JSON.parse(quote.items); } catch { items = []; }

  const getStatusVariant = (s: string) => {
    switch (s) {
      case "ACCEPTED": return "success";
      case "SENT": return "warning";
      case "REJECTED": case "CANCELLED": return "danger";
      default: return "default";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/cotizaciones")}>← Volver</Button>
        <h1 className="text-2xl font-bold text-white">Cotización</h1>
        <Badge variant={getStatusVariant(quote.status)}>{QUOTE_STATUS_LABELS[quote.status]}</Badge>
      </div>

      <div className="bg-metal-900 border border-metal-700 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div><p className="text-metal-500">Cliente</p><p className="text-white">{quote.client.name}</p></div>
          <div><p className="text-metal-500">Teléfono</p><p className="text-white">{quote.client.phone}</p></div>
          <div><p className="text-metal-500">Servicio</p><p className="text-white">{quote.appointment.service.name}</p></div>
          <div><p className="text-metal-500">Fecha de visita</p><p className="text-white">{quote.appointment.scheduledDate}</p></div>
        </div>
        {quote.validUntil && (
          <p className="text-metal-500 text-xs">Válida hasta: {new Date(quote.validUntil).toLocaleDateString("es-CO")}</p>
        )}
      </div>

      <div className="bg-metal-900 border border-metal-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Conceptos</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-metal-700">
              <th className="text-left py-2 text-metal-400">Concepto</th>
              <th className="text-right py-2 text-metal-400">Cant.</th>
              <th className="text-right py-2 text-metal-400">Valor Unit.</th>
              <th className="text-right py-2 text-metal-400">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, i: number) => (
              <tr key={i} className="border-b border-metal-800">
                <td className="py-2 text-white">{item.description}</td>
                <td className="py-2 text-right text-metal-300">{item.quantity}</td>
                <td className="py-2 text-right text-metal-300">${(item.unitPrice || 0).toLocaleString("es-CO")}</td>
                <td className="py-2 text-right text-white">${(item.total || 0).toLocaleString("es-CO")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-metal-400">Subtotal</span><span className="text-white">${quote.subtotal.toLocaleString("es-CO")}</span></div>
          {quote.displacement != null && quote.displacement > 0 && (
            <div className="flex justify-between"><span className="text-metal-400">Desplazamiento</span><span className="text-white">${quote.displacement.toLocaleString("es-CO")}</span></div>
          )}
          <div className="flex justify-between border-t border-metal-700 pt-2 mt-2">
            <span className="text-white font-semibold">Total</span>
            <span className="text-accent font-bold text-lg">${quote.total.toLocaleString("es-CO")}</span>
          </div>
        </div>
        {quote.observations && (
          <div className="mt-4 p-3 bg-metal-800 rounded-lg">
            <p className="text-sm text-metal-400">Observaciones:</p>
            <p className="text-metal-300 text-sm">{quote.observations}</p>
          </div>
        )}
      </div>

      {quote.status === "DRAFT" && (
        <div className="flex gap-3">
          <Button onClick={handleSend} loading={submitting}>Enviar al Cliente</Button>
          <Button variant="danger" onClick={handleCancel} loading={submitting}>Cancelar</Button>
        </div>
      )}

      {quote.status === "SENT" && (
        <div className="flex gap-3">
          <Button variant="danger" onClick={handleCancel} loading={submitting}>Cancelar</Button>
        </div>
      )}
    </div>
  );
}
