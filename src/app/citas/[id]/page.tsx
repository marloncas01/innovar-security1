"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import StatusBadge from "@/components/ui/StatusBadge";

interface PhotoItem {
  id: string;
  url: string;
  description: string | null;
  fileName: string;
}

interface PaymentInfo {
  id: string;
  amount: number;
  status: string;
  reference?: string | null;
  transactionId?: string | null;
}

interface QuoteInfo {
  id: string;
  total: number;
  status: string;
}

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
  createdAt: string;
  confirmedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  paymentId?: string | null;
  quoteId?: string | null;
  payment?: PaymentInfo | null;
  quotes?: QuoteInfo[];
  photos?: PhotoItem[];
  service: { name: string; duration: number | null };
  client: { name: string; phone: string; email: string };
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

interface TimelineStep {
  key: string;
  label: string;
  date: string | null;
  state: "completed" | "active" | "pending";
}

function buildTimeline(appointment: AppointmentDetail): TimelineStep[] {
  const isPaid = appointment.payment?.status === "PAID";
  const hasPayment = !!appointment.payment || !!appointment.paymentId;

  const steps: TimelineStep[] = [
    {
      key: "solicitud",
      label: "Solicitud",
      date: appointment.createdAt,
      state: "completed",
    },
    {
      key: "pago",
      label: "Pago",
      date: null,
      state: isPaid ? "completed" : hasPayment ? "active" : "pending",
    },
    {
      key: "confirmacion",
      label: "Confirmación",
      date: (appointment as any).confirmedAt as string | null ?? null,
      state: (appointment.status === "CONFIRMED" || appointment.status === "REPROGRAMMED" || appointment.status === "COMPLETED") ? "completed" : "pending",
    },
    {
      key: "visita",
      label: "Visita",
      date: (appointment as any).completedAt as string | null ?? null,
      state: appointment.status === "COMPLETED" ? "completed" : "pending",
    },
  ];

  return steps;
}

function SkeletonLoader() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="h-10 w-32 bg-metal-800 rounded-lg animate-pulse" />
      <div className="h-24 bg-metal-900 border border-metal-700 rounded-xl animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 bg-metal-900 border border-metal-700 rounded-xl animate-pulse" />
          <div className="h-64 bg-metal-900 border border-metal-700 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-metal-900 border border-metal-700 rounded-xl animate-pulse" />
          <div className="h-32 bg-metal-900 border border-metal-700 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function CitaDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const router = useRouter();
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReprogram, setShowReprogram] = useState(false);
  const [reprogramForm, setReprogramForm] = useState({ newDate: "", newTime: "", reason: "" });
  const [reprogramError, setReprogramError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingPhotos(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("appointmentId", id);
      Array.from(e.target.files).forEach((file) => {
        formData.append("photos", file);
      });
      const res = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Error al subir fotos");
      } else {
        fetchAppointment();
      }
    } catch {
      setUploadError("Error de conexión al subir fotos");
    } finally {
      setUploadingPhotos(false);
      e.target.value = "";
    }
  };

  const fetchAppointment = () => {
    fetch(`/api/citas/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No autorizado o cita no encontrada");
        return res.json();
      })
      .then((data) => {
        setAppointment(data);
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

  const handleReprogram = async () => {
    setReprogramError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/citas/${id}/reprogram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reprogramForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setReprogramError(data.error);
        setSubmitting(false);
        return;
      }
      setShowReprogram(false);
      fetchAppointment();
    } catch {
      setReprogramError("Error de conexión");
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("¿Estás seguro de cancelar esta cita?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/citas/${id}/cancel`, { method: "POST" });
      if (res.ok) fetchAppointment();
    } catch {
      setError("Error al cancelar");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <SkeletonLoader />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-900/30 border border-red-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-400 text-lg">{error || "Cita no encontrada"}</p>
          <Button variant="outline" onClick={() => router.push("/citas")}>
            Volver a Citas
          </Button>
        </div>
      </div>
    );
  }

  const canReprogram =
    ["CONFIRMED", "REPROGRAMMED"].includes(appointment.status) &&
    appointment.reprogramRequests.every((r) => r.status !== "PENDING");

  const canCancel = ["PENDING", "CONFIRMED", "REPROGRAMMED", "REPROGRAM_REQUESTED"].includes(
    appointment.status
  );

  const hasPayment = !!appointment.payment || !!appointment.paymentId;
  const isPaid = appointment.payment?.status === "PAID";
  const hasQuote = (appointment.quotes && appointment.quotes.length > 0) || !!appointment.quoteId;
  const isCancelled = appointment.status === "CANCELLED";
  const canPay = ["PENDING", "CONFIRMED", "REPROGRAMMED"].includes(appointment.status) && !isPaid && !isCancelled;

  const timeline = buildTimeline(appointment);

  const conditions = [
    { label: "Trabajo en altura", value: appointment.hasHeightWork },
    { label: "Riesgo eléctrico", value: appointment.hasElectricRisk },
    { label: "Acceso complicado", value: appointment.hasComplicatedAccess },
    { label: "Condiciones especiales", value: appointment.hasSpecialConditions },
  ];
  const activeConditions = conditions.filter((c) => c.value);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Back */}
        <button
          onClick={() => router.push("/citas")}
          className="inline-flex items-center gap-2 text-sm text-metal-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Citas
        </button>

        {/* Header */}
        <div className="bg-metal-900 border border-metal-700 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-metal-500 text-xs font-mono">#{appointment.id.slice(0, 8)}</p>
              <h1 className="text-2xl font-bold text-white">{appointment.service.name}</h1>
              <p className="text-metal-400 text-sm">
                {appointment.client.name} &middot; {appointment.client.phone}
              </p>
            </div>
            <StatusBadge status={appointment.status} />
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment info */}
            <div className="bg-metal-900 border border-metal-700 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-metal-400 uppercase tracking-wider mb-4">
                Información de la Cita
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-metal-500">Fecha</p>
                  <p className="text-white font-medium">{appointment.scheduledDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-metal-500">Horario</p>
                  <p className="text-white font-medium">
                    {appointment.startTime} - {appointment.endTime}
                  </p>
                </div>
                {appointment.service.duration && (
                  <div className="space-y-1">
                    <p className="text-xs text-metal-500">Duración estimada</p>
                    <p className="text-white font-medium">{appointment.service.duration} min</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-metal-800 space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-metal-500">Dirección</p>
                  <p className="text-white">{appointment.locationAddress}</p>
                </div>
                {appointment.locationReference && (
                  <div className="space-y-1">
                    <p className="text-xs text-metal-500">Referencia</p>
                    <p className="text-metal-300">{appointment.locationReference}</p>
                  </div>
                )}
                {appointment.locationNotes && (
                  <div className="space-y-1">
                    <p className="text-xs text-metal-500">Notas del lugar</p>
                    <p className="text-metal-300">{appointment.locationNotes}</p>
                  </div>
                )}
              </div>

              {appointment.adminNotes && (
                <div className="mt-4 pt-4 border-t border-metal-800 space-y-1">
                  <p className="text-xs text-metal-500">Notas del administrador</p>
                  <p className="text-metal-300">{appointment.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-metal-900 border border-metal-700 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-metal-400 uppercase tracking-wider mb-6">
                Progreso de la Cita
              </h2>
              <div className="relative">
                {timeline.map((step, index) => {
                  const isLast = index === timeline.length - 1;
                  const dotColor =
                    step.state === "completed"
                      ? "bg-green-500 border-green-400"
                      : step.state === "active"
                        ? "bg-blue-500 border-blue-400"
                        : "bg-metal-700 border-metal-600";
                  const lineColor =
                    step.state === "completed"
                      ? "bg-green-500"
                      : step.state === "active"
                        ? "bg-blue-500/30"
                        : "bg-metal-700";
                  const textColor =
                    step.state === "completed"
                      ? "text-green-300"
                      : step.state === "active"
                        ? "text-blue-300"
                        : "text-metal-500";

                  return (
                    <div key={step.key} className="relative flex gap-4">
                      {/* Line */}
                      {!isLast && (
                        <div className="absolute left-[11px] top-6 w-0.5 h-full">
                          <div className={`w-full h-full ${lineColor}`} />
                        </div>
                      )}

                      {/* Dot */}
                      <div className="relative z-10 flex-shrink-0 mt-1">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${dotColor}`}
                        >
                          {step.state === "completed" && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {step.state === "active" && (
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pb-8">
                        <p className={`text-sm font-medium ${textColor}`}>{step.label}</p>
                        {step.date ? (
                          <p className="text-xs text-metal-500 mt-0.5">
                            {new Date(step.date).toLocaleDateString("es-CO", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        ) : (
                          <p className="text-xs text-metal-600 mt-0.5">
                            {step.state === "active" ? "En curso..." : "Pendiente"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {isCancelled && (
                <div className="mt-2 p-3 bg-red-900/20 border border-red-800/40 rounded-lg">
                  <p className="text-sm text-red-300">
                    Esta cita fue cancelada
                    {(appointment as any).cancelledAt
                      ? ` el ${new Date((appointment as any).cancelledAt as string).toLocaleDateString("es-CO")}`
                      : ""}
                  </p>
                </div>
              )}
            </div>

            {/* Conditions */}
            {(activeConditions.length > 0 || appointment.conditionNotes) && (
              <div className="bg-metal-900 border border-metal-700 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-metal-400 uppercase tracking-wider mb-4">
                  Condiciones del Lugar
                </h2>
                {activeConditions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {activeConditions.map((c) => (
                      <span
                        key={c.label}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-900/30 border border-amber-700/40 text-amber-300"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {c.label}
                      </span>
                    ))}
                  </div>
                )}
                {appointment.conditionNotes && (
                  <p className="text-sm text-metal-300">{appointment.conditionNotes}</p>
                )}
                {appointment.specialConditionsDescription && (
                  <p className="text-sm text-metal-300 mt-2">
                    <span className="text-metal-500">Detalle:</span>{" "}
                    {appointment.specialConditionsDescription}
                  </p>
                )}
              </div>
            )}

            {/* Photos Section */}
            <div className="bg-metal-900 border border-metal-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-metal-400 uppercase tracking-wider">
                    Fotografías del Lugar
                  </h2>
                  <p className="text-xs text-metal-500 mt-0.5">
                    Fotos registradas para evaluación técnica
                  </p>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-accent hover:bg-accent-dark text-white rounded-lg transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {uploadingPhotos ? "Subiendo..." : "Subir Fotos"}
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={uploadingPhotos}
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>

              {uploadError && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-xs text-red-300">
                  {uploadError}
                </div>
              )}

              {appointment.photos && appointment.photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {appointment.photos.map((photo) => (
                    <a
                      key={photo.id}
                      href={photo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-video bg-metal-800 rounded-lg overflow-hidden border border-metal-700 hover:border-accent transition-colors block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.description || photo.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs text-white font-medium bg-black/60 px-2 py-1 rounded">Ver foto</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-metal-800 rounded-lg">
                  <svg className="w-8 h-8 text-metal-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-metal-400">Aún no hay fotos registradas para esta cita.</p>
                  <p className="text-[11px] text-metal-600 mt-0.5">Puedes subir fotos del lugar para ayudar al equipo técnico.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-metal-900 border border-metal-700 rounded-xl p-6 space-y-3">
              <h2 className="text-sm font-semibold text-metal-400 uppercase tracking-wider mb-2">
                Acciones
              </h2>

              {canReprogram && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowReprogram(!showReprogram)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Solicitar Reprogramación
                </Button>
              )}

              {canPay && (
                <Button
                  variant="primary"
                  className="w-full justify-start"
                  onClick={() => router.push(`/citas/${appointment.id}/pago`)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {hasPayment ? "Continuar Pago" : "Ir a Pago"}
                </Button>
              )}

              {hasPayment && isPaid && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-emerald-400 border-emerald-500/30 hover:border-emerald-500"
                  onClick={() => router.push(`/citas/${appointment.id}/pago`)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ver Comprobante de Pago
                </Button>
              )}

              {hasQuote && (
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => router.push(`/citas/${appointment.id}/cotizacion`)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Ver Cotización
                </Button>
              )}

              {canCancel && (
                <Button
                  variant="danger"
                  className="w-full justify-start"
                  onClick={handleCancel}
                  loading={submitting}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar Cita
                </Button>
              )}

              {!canReprogram && !canPay && !hasQuote && !canCancel && !isCancelled && (
                <p className="text-sm text-metal-500">No hay acciones disponibles.</p>
              )}

              {isCancelled && (
                <p className="text-sm text-metal-500">Esta cita fue cancelada.</p>
              )}

              {/* Reprogram form */}
              {showReprogram && (
                <div className="mt-4 space-y-3 border-t border-metal-800 pt-4">
                  <p className="text-xs text-metal-400">
                    Selecciona una nueva fecha y hora. La solicitud será revisada por el administrador.
                  </p>
                  {reprogramError && (
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                      <p className="text-xs text-red-300">{reprogramError}</p>
                    </div>
                  )}
                  <input
                    type="date"
                    value={reprogramForm.newDate}
                    onChange={(e) => setReprogramForm({ ...reprogramForm, newDate: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-metal-800 border border-metal-600 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <input
                    type="time"
                    value={reprogramForm.newTime}
                    onChange={(e) => setReprogramForm({ ...reprogramForm, newTime: e.target.value })}
                    className="w-full bg-metal-800 border border-metal-600 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Motivo (opcional)"
                    value={reprogramForm.reason}
                    onChange={(e) => setReprogramForm({ ...reprogramForm, reason: e.target.value })}
                    className="w-full bg-metal-800 border border-metal-600 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleReprogram} loading={submitting} size="sm" className="flex-1">
                      Enviar Solicitud
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReprogram(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* History */}
            {appointment.historyItems.length > 0 && (
              <div className="bg-metal-900 border border-metal-700 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-metal-400 uppercase tracking-wider mb-4">
                  Historial
                </h2>
                <div className="space-y-3">
                  {appointment.historyItems.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-white text-xs">{item.details || item.action}</p>
                        <p className="text-metal-500 text-[11px]">
                          {new Date(item.performedAt).toLocaleString("es-CO")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
