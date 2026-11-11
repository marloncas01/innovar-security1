"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Badge, Select } from "@/components/ui";
import StatusBadge from "@/components/ui/StatusBadge";
import { STATUS_LABELS, QUOTE_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";

interface AppointmentDetail {
  id: string;
  status: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  locationAddress: string;
  locationReference: string | null;
  locationNotes: string | null;
  conditionNotes: string | null;
  hasHeightWork: boolean;
  hasElectricRisk: boolean;
  hasComplicatedAccess: boolean;
  hasSpecialConditions: boolean;
  specialConditionsDescription: string | null;
  adminNotes: string | null;
  technicianNotes: string | null;
  createdAt: string;
  service: { name: string; duration: number | null };
  client: { id: string; name: string; phone: string; email: string };
  photos?: Array<{
    id: string;
    url: string;
    caption: string | null;
    createdAt: string;
  }>;
  payment?: {
    id: string;
    amount: number;
    status: string;
    method: string;
    reference: string | null;
    createdAt: string;
  } | null;
  quotes?: Array<{
    id: string;
    total: number;
    subtotal: number;
    displacement: number | null;
    status: string;
    items: string;
    createdAt: string;
    validUntil: string | null;
    sentAt: string | null;
  }>;
  historyItems: Array<{
    id: string;
    action: string;
    details: string | null;
    performedBy: string;
    performedAt: string;
  }>;
  reprogramRequests: Array<{
    id: string;
    newDate: string | null;
    newTime: string | null;
    reason: string | null;
    status: string;
    adminNotes: string | null;
    createdAt: string;
  }>;
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "CONFIRMED":
    case "REPROGRAMMED":
      return "success";
    case "PENDING":
    case "REPROGRAM_REQUESTED":
      return "warning";
    case "CANCELLED":
    case "CLIENT_NO_SHOW":
      return "danger";
    case "COMPLETED":
      return "info";
    default:
      return "default";
  }
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmada" },
  { value: "REPROGRAMMED", label: "Reprogramada" },
  { value: "COMPLETED", label: "Completada" },
  { value: "CANCELLED", label: "Cancelada" },
  { value: "CLIENT_NO_SHOW", label: "Cliente no disponible" },
];

export default function AdminCitaDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const router = useRouter();
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Quote modal/form state
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteItems, setQuoteItems] = useState<Array<{ description: string; quantity: number; unitPrice: number }>>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [displacement, setDisplacement] = useState<number>(0);
  const [quoteObservations, setQuoteObservations] = useState("");
  const [quoteValidDays, setQuoteValidDays] = useState(15);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const handleAddQuoteItem = () => {
    setQuoteItems([...quoteItems, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveQuoteItem = (index: number) => {
    if (quoteItems.length <= 1) return;
    setQuoteItems(quoteItems.filter((_, i) => i !== index));
  };

  const handleQuoteItemChange = (index: number, field: string, value: any) => {
    const updated = [...quoteItems];
    updated[index] = { ...updated[index], [field]: value };
    setQuoteItems(updated);
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteError("");
    const validItems = quoteItems.filter((it) => it.description.trim() !== "");
    if (validItems.length === 0) {
      setQuoteError("Debe agregar al menos un ítem con descripción.");
      return;
    }

    setQuoteSubmitting(true);
    try {
      const res = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: id,
          items: validItems,
          displacement: Number(displacement) || 0,
          observations: quoteObservations,
          validDays: Number(quoteValidDays) || 15,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al crear cotización");
      }

      setShowQuoteModal(false);
      setQuoteItems([{ description: "", quantity: 1, unitPrice: 0 }]);
      setDisplacement(0);
      setQuoteObservations("");
      fetchAppointment();
    } catch (err: any) {
      setQuoteError(err.message || "Error al crear la cotización");
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const fetchAppointment = () => {
    fetch(`/api/admin/citas/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Cita no encontrada");
        return res.json();
      })
      .then((data) => {
        setAppointment(data);
        setNewStatus(data.status);
        setAdminNotes(data.adminNotes || "");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAppointment();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusUpdate = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/citas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminNotes }),
      });
      if (res.ok) fetchAppointment();
    } catch {
      setError("Error al actualizar");
    }
    setSubmitting(false);
  };

  const handleReprogramRespond = async (requestId: string, approve: boolean) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/citas/${id}/reprogram/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve }),
      });
      if (res.ok) fetchAppointment();
    } catch {
      setError("Error al responder");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400">{error || "Cita no encontrada"}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/citas")}>
          Volver
        </Button>
      </div>
    );
  }

  const pendingReprogram = appointment.reprogramRequests.find((r) => r.status === "PENDING");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/citas")}>
          ← Volver
        </Button>
        <h1 className="text-2xl font-bold text-white">Detalle de Cita</h1>
      </div>

      {/* Header */}
      <div className="bg-metal-900 border border-metal-700 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-metal-500 text-sm">ID: {appointment.id.slice(0, 8)}...</p>
            <h2 className="text-xl font-semibold text-white">{appointment.service.name}</h2>
          </div>
          <Badge variant={getStatusBadgeVariant(appointment.status)}>
            {STATUS_LABELS[appointment.status] || appointment.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment info */}
        <div className="bg-metal-900 border border-metal-700 rounded-xl p-6 space-y-3">
          <h3 className="text-lg font-semibold text-white mb-3">Información de la Cita</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-metal-500">Fecha</p>
              <p className="text-white">{appointment.scheduledDate}</p>
            </div>
            <div>
              <p className="text-metal-500">Horario</p>
              <p className="text-white">{appointment.startTime} - {appointment.endTime}</p>
            </div>
            <div className="col-span-2">
              <p className="text-metal-500">Dirección</p>
              <p className="text-white">{appointment.locationAddress}</p>
            </div>
            {appointment.locationReference && (
              <div className="col-span-2">
                <p className="text-metal-500">Referencia</p>
                <p className="text-white">{appointment.locationReference}</p>
              </div>
            )}
            {appointment.conditionNotes && (
              <div className="col-span-2">
                <p className="text-metal-500">Condiciones del lugar</p>
                <p className="text-metal-300">{appointment.conditionNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Client info */}
        <div className="bg-metal-900 border border-metal-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Cliente</h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-metal-500">Nombre</p>
              <p className="text-white">{appointment.client.name}</p>
            </div>
            <div>
              <p className="text-metal-500">Teléfono</p>
              <p className="text-white">{appointment.client.phone}</p>
            </div>
            <div>
              <p className="text-metal-500">Email</p>
              <p className="text-white">{appointment.client.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Photos Section */}
      <div className="bg-metal-900 border border-metal-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Fotografías del Lugar ({appointment.photos?.length || 0})
          </h3>
        </div>
        {(!appointment.photos || appointment.photos.length === 0) ? (
          <p className="text-metal-400 text-sm italic">
            No se han adjuntado fotos para esta cita.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {appointment.photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-lg overflow-hidden border border-metal-700 bg-metal-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption || "Foto del lugar"}
                  className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                />
                <a
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity"
                >
                  Ver original ↗
                </a>
                {photo.caption && (
                  <div className="p-1.5 text-xs text-metal-300 truncate bg-metal-900/90">
                    {photo.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Information */}
      <div className="bg-metal-900 border border-metal-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Información de Pago</h3>
        {appointment.payment ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-metal-500">Monto</p>
                <p className="text-white font-semibold">
                  ${appointment.payment.amount.toLocaleString("es-CO")} COP
                </p>
              </div>
              <div>
                <p className="text-metal-500">Estado de Pago</p>
                <div className="mt-1">
                  <StatusBadge status={appointment.payment.status} />
                </div>
              </div>
              <div>
                <p className="text-metal-500">Método</p>
                <p className="text-white">{appointment.payment.method || "Transferencia"}</p>
              </div>
              <div>
                <p className="text-metal-500">Referencia</p>
                <p className="text-white font-mono text-xs">
                  {appointment.payment.reference || "N/A"}
                </p>
              </div>
            </div>

            {/* Quick verification buttons for admin */}
            {(appointment.payment.status === "PROCESSING" || appointment.payment.status === "PENDING") && (
              <div className="flex items-center justify-between p-3.5 bg-metal-800/80 border border-metal-700 rounded-lg">
                <span className="text-xs text-yellow-300 font-medium">
                  {appointment.payment.status === "PROCESSING" 
                    ? "⚠️ El cliente ha reportado este pago. ¿Deseas verificarlo y confirmar la cita?"
                    : "Puedes registrar o aprobar manualmente el pago recibido."}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (!confirm("¿Aprobar y confirmar el pago de esta cita?")) return;
                      await fetch(`/api/admin/payments/${appointment.payment?.id}/verify`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "CONFIRM" }),
                      });
                      fetchAppointment();
                    }}
                  >
                    Confirmar Pago ✓
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      if (!confirm("¿Rechazar este pago?")) return;
                      await fetch(`/api/admin/payments/${appointment.payment?.id}/verify`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "REJECT" }),
                      });
                      fetchAppointment();
                    }}
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-metal-400 text-sm">
              No hay registro de pago para el costo de visita técnica.
            </p>
            <Badge variant="warning">Sin Pago</Badge>
          </div>
        )}
      </div>

      {/* Quotes (Cotizaciones) Section */}
      <div className="bg-metal-900 border border-metal-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Cotizaciones</h3>
            <p className="text-metal-400 text-sm">
              Propuestas económicas enviadas al cliente para esta cita.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowQuoteModal(!showQuoteModal)}
          >
            {showQuoteModal ? "Cerrar Formulario" : "+ Nueva Cotización"}
          </Button>
        </div>

        {/* New Quote Form / Modal */}
        {showQuoteModal && (
          <form
            onSubmit={handleCreateQuote}
            className="mb-6 p-4 bg-metal-800/80 border border-metal-700 rounded-lg space-y-4"
          >
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Crear Propuesta de Cotización
            </h4>

            {quoteError && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded text-red-300 text-xs">
                {quoteError}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-metal-300">
                  ÍTEMS Y CONCEPTOS
                </label>
                <button
                  type="button"
                  onClick={handleAddQuoteItem}
                  className="text-accent hover:text-accent-light text-xs font-medium"
                >
                  + Añadir concepto
                </button>
              </div>

              {quoteItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Descripción (ej: Cámara IP 4MP)"
                    value={item.description}
                    onChange={(e) => handleQuoteItemChange(idx, "description", e.target.value)}
                    required
                    className="flex-1 bg-metal-900 border border-metal-600 rounded px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-accent"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Cant."
                    value={item.quantity}
                    onChange={(e) => handleQuoteItemChange(idx, "quantity", parseInt(e.target.value) || 1)}
                    className="w-20 bg-metal-900 border border-metal-600 rounded px-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-accent text-right"
                  />
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="Precio Unit."
                    value={item.unitPrice}
                    onChange={(e) => handleQuoteItemChange(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="w-32 bg-metal-900 border border-metal-600 rounded px-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-accent text-right"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveQuoteItem(idx)}
                    disabled={quoteItems.length <= 1}
                    className="text-red-400 hover:text-red-300 px-2 py-1 text-sm disabled:opacity-30"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-metal-300 mb-1">
                  Valor de desplazamiento / viáticos (COP)
                </label>
                <input
                  type="number"
                  min="0"
                  value={displacement}
                  onChange={(e) => setDisplacement(parseFloat(e.target.value) || 0)}
                  className="w-full bg-metal-900 border border-metal-600 rounded px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-metal-300 mb-1">
                  Días de validez
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={quoteValidDays}
                  onChange={(e) => setQuoteValidDays(parseInt(e.target.value) || 15)}
                  className="w-full bg-metal-900 border border-metal-600 rounded px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-metal-300 mb-1">
                Observaciones / Condiciones técnicas
              </label>
              <textarea
                rows={2}
                value={quoteObservations}
                onChange={(e) => setQuoteObservations(e.target.value)}
                placeholder="Garantía de 1 año, instalación incluye cableado UTP categoría 6..."
                className="w-full bg-metal-900 border border-metal-600 rounded px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowQuoteModal(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                loading={quoteSubmitting}
              >
                Guardar Cotización
              </Button>
            </div>
          </form>
        )}

        {/* Existing quotes list */}
        {(!appointment.quotes || appointment.quotes.length === 0) ? (
          <p className="text-metal-400 text-sm italic">
            No hay cotizaciones emitidas para esta cita aún.
          </p>
        ) : (
          <div className="space-y-3">
            {appointment.quotes.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-3.5 bg-metal-800/60 border border-metal-700 rounded-lg hover:border-metal-600 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      ${q.total.toLocaleString("es-CO")} COP
                    </span>
                    <StatusBadge status={q.status} />
                  </div>
                  <p className="text-xs text-metal-400">
                    Creada: {new Date(q.createdAt).toLocaleDateString("es-CO")}
                    {q.validUntil && (
                      <> • Válida hasta: {new Date(q.validUntil).toLocaleDateString("es-CO")}</>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/cotizaciones/${q.id}`}
                    className="text-xs bg-metal-700 hover:bg-metal-600 text-white px-3 py-1.5 rounded font-medium transition-colors"
                  >
                    Ver detalle →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending reprogram request */}
      {pendingReprogram && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-300 mb-3">
            Solicitud de Reprogramación Pendiente
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <p className="text-metal-500">Nueva fecha</p>
              <p className="text-white">
                {pendingReprogram.newDate
                  ? new Date(pendingReprogram.newDate).toISOString().split("T")[0]
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-metal-500">Nueva hora</p>
              <p className="text-white">{pendingReprogram.newTime || "—"}</p>
            </div>
            {pendingReprogram.reason && (
              <div className="col-span-2">
                <p className="text-metal-500">Motivo</p>
                <p className="text-white">{pendingReprogram.reason}</p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => handleReprogramRespond(pendingReprogram.id, true)}
              loading={submitting}
              size="sm"
            >
              Aprobar
            </Button>
            <Button
              variant="danger"
              onClick={() => handleReprogramRespond(pendingReprogram.id, false)}
              loading={submitting}
              size="sm"
            >
              Rechazar
            </Button>
          </div>
        </div>
      )}

      {/* Admin controls */}
      <div className="bg-metal-900 border border-metal-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Control Administrativo</h3>
        <div className="space-y-4">
          <Select
            label="Estado"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={STATUS_OPTIONS}
          />
          <div>
            <label className="block text-sm font-medium text-metal-300 mb-1">
              Notas del administrador
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="w-full bg-metal-800 border border-metal-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Notas internas..."
            />
          </div>
          <Button onClick={handleStatusUpdate} loading={submitting}>
            Actualizar Cita
          </Button>
        </div>
      </div>

      {/* History */}
      {appointment.historyItems.length > 0 && (
        <div className="bg-metal-900 border border-metal-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Historial</h3>
          <div className="space-y-3">
            {appointment.historyItems.map((item) => (
              <div key={item.id} className="flex gap-3 text-sm">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-white">{item.details || item.action}</p>
                  <p className="text-metal-500 text-xs">
                    {new Date(item.performedAt).toLocaleString("es-CO")} — {item.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
