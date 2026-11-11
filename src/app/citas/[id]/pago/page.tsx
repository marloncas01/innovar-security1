"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui";

interface Appointment {
  id: string;
  service: { name: string; price?: number };
  scheduledDate: string;
  status: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  reference?: string | null;
  transactionId?: string | null;
  method?: string | null;
  notes?: string | null;
  createdAt: string;
}

interface PublicSettings {
  business_name?: string;
  business_phone?: string;
  payment_nequi_number?: string;
  payment_nequi_name?: string;
  payment_bancolombia_type?: string;
  payment_bancolombia_number?: string;
  payment_bancolombia_name?: string;
  payment_instructions?: string;
}

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function PagoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Formulario de reporte de pago
  const [selectedMethod, setSelectedMethod] = useState<"NEQUI" | "BANCOLOMBIA">("NEQUI");
  const [referenceInput, setReferenceInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  async function loadData() {
    try {
      const [aptRes, payRes, setRes] = await Promise.all([
        fetch(`/api/citas/${id}`),
        fetch(`/api/citas/${id}/payment`),
        fetch(`/api/settings/public`),
      ]);

      if (!aptRes.ok) throw new Error("No se pudo cargar la cita");
      const aptData = await aptRes.json();
      setAppointment(aptData);

      if (payRes.ok) {
        const payData = await payRes.json();
        setPayment(payData);
      }

      if (setRes.ok) {
        const setData = await setRes.json();
        setSettings(setData);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  function copyToClipboard(text: string, key: string) {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  }

  async function handleReportPayment(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setReportError(null);
    setReportSuccess(null);

    try {
      const formData = new FormData();
      formData.append("method", selectedMethod);
      formData.append("reference", referenceInput.trim());
      formData.append("notes", notesInput.trim());
      if (receiptFile) {
        formData.append("receipt", receiptFile);
      }

      const res = await fetch(`/api/citas/${id}/report-payment`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar el reporte");

      setReportSuccess(data.message || "Pago reportado exitosamente");
      setReferenceInput("");
      setNotesInput("");
      setReceiptFile(null);
      await loadData();
    } catch (err: any) {
      setReportError(err.message || "No se pudo reportar el pago");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <svg className="w-8 h-8 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-metal-300 text-lg">{error || "Cita no encontrada"}</p>
        <Link href="/citas" className="text-accent hover:text-accent-light transition-colors">
          Volver a citas
        </Link>
      </div>
    );
  }

  const nequiNumber = settings?.payment_nequi_number || "3044451436";
  const nequiName = settings?.payment_nequi_name || "Innovar Security";
  const bancolombiaNumber = settings?.payment_bancolombia_number || "Pendiente de configurar";
  const bancolombiaType = settings?.payment_bancolombia_type || "Ahorros";
  const bancolombiaName = settings?.payment_bancolombia_name || "Innovar Security";

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href={`/citas/${id}`}
          className="inline-flex items-center gap-2 text-metal-400 hover:text-white transition-colors group text-sm"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver a la cita
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pago de Visita Técnica</h1>
          <p className="text-metal-400 text-sm mt-1">
            Realiza tu transferencia a través de <strong className="text-white">Nequi</strong> o <strong className="text-white">Bancolombia</strong>.
            Una vez enviado tu reporte, el administrador validará la transacción para confirmar tu cita.
          </p>
        </div>

        {/* Resumen de cita */}
        <div className="bg-metal-900 border border-metal-800 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <p className="text-xs text-metal-400 uppercase font-medium">Servicio</p>
            <p className="text-white font-semibold text-lg">{appointment.service?.name}</p>
            <p className="text-xs text-metal-500 mt-0.5">
              Fecha programada: {new Date(appointment.scheduledDate).toLocaleDateString("es-CO", { dateStyle: "long" })}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-metal-400 uppercase font-medium">Valor a Pagar</p>
            <p className="text-2xl font-bold text-accent">
              {formatCOP(payment?.amount || appointment.service?.price || 0)}
            </p>
            <div className="mt-1">
              <StatusBadge status={payment?.status || "PENDING"} />
            </div>
          </div>
        </div>

        {/* Cuentas de Transferencia (Nequi y Bancolombia) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nequi Card */}
          <div className={`p-5 rounded-xl border transition-all ${
            selectedMethod === "NEQUI"
              ? "bg-[#20002c]/40 border-fuchsia-500/60 shadow-lg shadow-fuchsia-950/40"
              : "bg-metal-900 border-metal-800 opacity-90"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-fuchsia-600 flex items-center justify-center font-bold text-white text-xs">
                  N
                </span>
                <span className="font-bold text-lg text-white">Nequi</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMethod("NEQUI")}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                  selectedMethod === "NEQUI"
                    ? "bg-fuchsia-500 text-white"
                    : "bg-metal-800 text-metal-400 hover:text-white"
                }`}
              >
                {selectedMethod === "NEQUI" ? "Seleccionado ✓" : "Seleccionar"}
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-metal-400">Número de Celular / Nequi:</p>
                <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-metal-700/60 mt-1">
                  <span className="font-mono font-bold text-white tracking-wider text-base">{nequiNumber}</span>
                  <button
                    onClick={() => copyToClipboard(nequiNumber, "nequi")}
                    className="text-xs text-accent hover:text-accent-light font-medium"
                  >
                    {copiedKey === "nequi" ? "¡Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-metal-400">Titular:</p>
                <p className="text-sm font-medium text-white">{nequiName}</p>
              </div>
            </div>
          </div>

          {/* Bancolombia Card */}
          <div className={`p-5 rounded-xl border transition-all ${
            selectedMethod === "BANCOLOMBIA"
              ? "bg-[#252000]/40 border-yellow-500/60 shadow-lg shadow-yellow-950/40"
              : "bg-metal-900 border-metal-800 opacity-90"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-yellow-500 text-black flex items-center justify-center font-bold text-xs">
                  B
                </span>
                <span className="font-bold text-lg text-white">Bancolombia</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMethod("BANCOLOMBIA")}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                  selectedMethod === "BANCOLOMBIA"
                    ? "bg-yellow-500 text-black font-semibold"
                    : "bg-metal-800 text-metal-400 hover:text-white"
                }`}
              >
                {selectedMethod === "BANCOLOMBIA" ? "Seleccionado ✓" : "Seleccionar"}
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-metal-400">Cuenta {bancolombiaType}:</p>
                <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-metal-700/60 mt-1">
                  <span className="font-mono font-bold text-white tracking-wider text-sm">{bancolombiaNumber}</span>
                  <button
                    onClick={() => copyToClipboard(bancolombiaNumber, "bancolombia")}
                    className="text-xs text-accent hover:text-accent-light font-medium"
                  >
                    {copiedKey === "bancolombia" ? "¡Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-metal-400">Titular:</p>
                <p className="text-sm font-medium text-white">{bancolombiaName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estado actual del pago */}
        {payment?.status === "PAID" ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center space-y-2">
            <span className="text-3xl">✅</span>
            <h3 className="text-lg font-bold text-emerald-400">Pago Verificado y Aprobado</h3>
            <p className="text-metal-300 text-sm">
              El administrador ya verificó tu transferencia. Tu cita técnica se encuentra formalmente confirmada.
            </p>
            {payment.reference && (
              <p className="text-xs text-metal-400 font-mono mt-2">
                Referencia: {payment.reference}
              </p>
            )}
          </div>
        ) : payment?.status === "PROCESSING" ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center space-y-2">
            <span className="text-3xl">⏳</span>
            <h3 className="text-lg font-bold text-yellow-300">Comprobante en Verificación</h3>
            <p className="text-metal-300 text-sm">
              Hemos recibido tu reporte de pago por <strong>{payment.method || "Transferencia"}</strong>.
              El administrador está revisando el comprobante para confirmar tu cita en el sistema.
            </p>
            {payment.reference && (
              <p className="text-xs text-metal-400 font-mono mt-1">
                Referencia reportada: {payment.reference}
              </p>
            )}
          </div>
        ) : (
          /* Formulario de reporte de pago */
          <div className="bg-metal-900 border border-metal-800 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Reportar Comprobante de Transferencia</h2>
              <p className="text-xs text-metal-400 mt-1">
                Una vez realices la transferencia desde tu aplicación móvil, ingresa el número de referencia y adjunta la captura o recibo.
              </p>
            </div>

            {reportSuccess && (
              <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-sm">
                {reportSuccess}
              </div>
            )}

            {reportError && (
              <div className="p-4 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-sm">
                {reportError}
              </div>
            )}

            <form onSubmit={handleReportPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-metal-300 mb-1">
                  Método de pago utilizado *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod("NEQUI")}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedMethod === "NEQUI"
                        ? "bg-fuchsia-950/50 border-fuchsia-500 text-white"
                        : "bg-metal-800 border-metal-700 text-metal-400"
                    }`}
                  >
                    Nequi ({nequiNumber})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMethod("BANCOLOMBIA")}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedMethod === "BANCOLOMBIA"
                        ? "bg-yellow-950/50 border-yellow-500 text-white"
                        : "bg-metal-800 border-metal-700 text-metal-400"
                    }`}
                  >
                    Bancolombia
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-metal-300 mb-1">
                  Número de Referencia / Comprobante M12345 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: M987654 o número de aprobación"
                  value={referenceInput}
                  onChange={(e) => setReferenceInput(e.target.value)}
                  className="w-full bg-metal-800 border border-metal-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-metal-300 mb-1">
                  Adjuntar captura o foto del comprobante (Opcional pero recomendado)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReceiptFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-metal-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-metal-800 file:text-white hover:file:bg-metal-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-metal-300 mb-1">
                  Notas adicionales (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Nombre de quien transfirió u observaciones..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full bg-metal-800 border border-metal-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>

              <button
                type="submit"
                disabled={processing || !referenceInput.trim()}
                className="w-full py-3 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-glow flex items-center justify-center gap-2"
              >
                {processing ? "Enviando comprobante..." : "Notificar y Enviar Comprobante al Administrador"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
