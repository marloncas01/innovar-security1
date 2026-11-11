"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea, Select } from "@/components/ui";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration: number | null;
}

interface TimeSlot {
  time: string;
  endTime: string;
  available: boolean;
}

interface AvailabilityResult {
  date: string;
  isWorkDay: boolean;
  isBlocked: boolean;
  blockDescription: string | null;
  slots: TimeSlot[];
}

const STEPS = ["Servicio", "Ubicación", "Fotos", "Fecha y Hora", "Resumen"];

const STEP_ICONS: Record<number, JSX.Element> = {
  0: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  1: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  2: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  3: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  4: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function NuevaCitaPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    serviceId: "",
    locationAddress: "",
    locationMunicipality: "",
    locationReference: "",
    locationNotes: "",
    conditionNotes: "",
    hasHeightWork: false,
    hasElectricRisk: false,
    hasComplicatedAccess: false,
    hasSpecialConditions: false,
    specialConditionsDescription: "",
    scheduledDate: "",
    startTime: "",
    endTime: "",
  });

  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (form.scheduledDate) {
      setLoadingAvailability(true);
      fetch(`/api/schedules/availability?date=${form.scheduledDate}`)
        .then((res) => res.json())
        .then((data) => {
          setAvailability(data);
          setLoadingAvailability(false);
        })
        .catch(() => setLoadingAvailability(false));
    }
  }, [form.scheduledDate]);

  const selectedService = services.find((s) => s.id === form.serviceId);

  const handleSlotSelect = (slot: TimeSlot) => {
    setForm({ ...form, startTime: slot.time, endTime: slot.endTime });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear la cita");
        setSubmitting(false);
        return;
      }
      router.push(`/citas/${data.id}`);
    } catch {
      setError("Error de conexión");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative">
          <div className="w-10 h-10 border-2 border-metal-700 rounded-full" />
          <div className="absolute inset-0 w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-metal-400 mt-5 text-sm">Cargando servicios...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Nueva Solicitud de Cita</h1>
        <p className="text-metal-400 text-sm mt-1">Completa los pasos para agendar tu servicio</p>
      </div>

      {/* Stepper */}
      <div className="mb-10">
        <div className="flex items-start overflow-x-auto pb-2 -mx-1 px-1">
          {STEPS.map((s, i) => {
            const isCompleted = i < step;
            const isCurrent = i === step;
            const isFuture = i > step;

            return (
              <div key={s} className="flex items-center flex-shrink-0 first:ml-0 ml-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                      transition-all duration-300
                      ${isCompleted
                        ? "bg-accent text-white shadow-glow"
                        : isCurrent
                        ? "bg-accent/15 text-accent border-2 border-accent shadow-glow"
                        : "bg-metal-800/60 text-metal-500 border border-metal-700"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <span
                    className={`
                      text-xs mt-1.5 font-medium whitespace-nowrap
                      ${isCurrent ? "text-white" : isCompleted ? "text-metal-300" : "text-metal-600"}
                    `}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex items-center mx-1 mt-[-18px]">
                    <div
                      className={`
                        w-6 sm:w-10 h-0.5 rounded-full transition-colors duration-300
                        ${i < step ? "bg-accent" : "bg-metal-700/60"}
                      `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Step 0: Service */}
      {step === 0 && (
        <div className="animate-fade-in">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Selecciona un servicio</h2>
              <p className="text-metal-400 text-sm mt-1">Elige el tipo de servicio que necesitas</p>
            </div>
            {services.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-14 h-14 bg-metal-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-metal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <p className="text-metal-400">No hay servicios disponibles actualmente.</p>
                <p className="text-metal-600 text-sm mt-1">Contacta al administrador para más información.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {services.map((service) => {
                  const isSelected = form.serviceId === service.id;
                  return (
                    <button
                      key={service.id}
                      onClick={() => setForm({ ...form, serviceId: service.id })}
                      className={`
                        text-left p-5 rounded-xl border-2 transition-all duration-200
                        ${isSelected
                          ? "border-accent bg-accent/10 shadow-glow"
                          : "border-[var(--color-border)] bg-metal-900/50 hover:border-metal-700 hover:bg-metal-900"
                        }
                      `}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`
                                w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors
                                ${isSelected ? "bg-accent" : "bg-metal-600"}
                              `}
                            />
                            <h3 className={`font-semibold ${isSelected ? "text-white" : "text-metal-200"}`}>
                              {service.name}
                            </h3>
                          </div>
                          {service.description && (
                            <p className="text-metal-400 text-sm mt-1.5 ml-5">{service.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2.5 ml-5">
                            {service.duration != null && (
                              <span className="text-metal-500 text-xs flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {service.duration} min
                              </span>
                            )}
                          </div>
                        </div>
                        {service.price != null && (
                          <span className={`
                            font-bold text-base whitespace-nowrap
                            ${isSelected ? "text-accent" : "text-metal-300"}
                          `}>
                            ${service.price.toLocaleString("es-CO")}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex justify-end pt-6">
            <Button
              onClick={() => setStep(1)}
              disabled={!form.serviceId}
              size="lg"
            >
              Siguiente
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="animate-fade-in">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Información de ubicación</h2>
              <p className="text-metal-400 text-sm mt-1">Indica dónde se realizará el servicio</p>
            </div>
            <div className="space-y-5">
              <Input
                label="Dirección *"
                placeholder="Dirección donde se realizará el servicio"
                value={form.locationAddress}
                onChange={(e) => setForm({ ...form, locationAddress: e.target.value })}
                required
              />
              <Input
                label="Municipio"
                placeholder="Ej: Fómeque, Bogotá..."
                value={form.locationMunicipality}
                onChange={(e) => setForm({ ...form, locationMunicipality: e.target.value })}
              />
              <Input
                label="Referencia"
                placeholder="Ej: frente al parque, casa esquinera..."
                value={form.locationReference}
                onChange={(e) => setForm({ ...form, locationReference: e.target.value })}
              />
              <Textarea
                label="Notas de ubicación"
                placeholder="Información adicional sobre la ubicación..."
                value={form.locationNotes}
                onChange={(e) => setForm({ ...form, locationNotes: e.target.value })}
                rows={2}
              />
              <Textarea
                label="Condiciones del lugar"
                placeholder="Describe condiciones relevantes del lugar (acceso, seguridad, etc.)"
                value={form.conditionNotes}
                onChange={(e) => setForm({ ...form, conditionNotes: e.target.value })}
                rows={3}
              />

              <div>
                <p className="block text-sm font-medium text-metal-200 mb-3">Condiciones del sitio</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { key: "hasHeightWork", label: "Trabajo en altura", icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" },
                    { key: "hasElectricRisk", label: "Riesgo eléctrico", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                    { key: "hasComplicatedAccess", label: "Acceso complicado", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" },
                    { key: "hasSpecialConditions", label: "Condiciones especiales", icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all
                        ${(form as any)[item.key]
                          ? "border-accent/50 bg-accent/10 text-white"
                          : "border-[var(--color-border)] bg-metal-900/50 text-metal-300 hover:border-metal-700"
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={(form as any)[item.key]}
                        onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })}
                        className="sr-only"
                      />
                      <div
                        className={`
                          w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                          ${(form as any)[item.key]
                            ? "bg-accent border-accent"
                            : "border-metal-600 bg-transparent"
                          }
                        `}
                      >
                        {(form as any)[item.key] && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {form.hasSpecialConditions && (
                <Textarea
                  label="Descripción de condiciones especiales"
                  placeholder="Describe las condiciones especiales..."
                  value={form.specialConditionsDescription}
                  onChange={(e) =>
                    setForm({ ...form, specialConditionsDescription: e.target.value })
                  }
                  rows={2}
                />
              )}
            </div>
          </div>
          <div className="flex justify-between pt-6">
            <Button variant="ghost" onClick={() => setStep(0)}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Atrás
            </Button>
            <Button
              onClick={() => setStep(2)}
              disabled={!form.locationAddress}
              size="lg"
            >
              Siguiente
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Photos (placeholder) */}
      {step === 2 && (
        <div className="animate-fade-in">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Fotografías</h2>
              <p className="text-metal-400 text-sm mt-1">Registra el estado del lugar</p>
            </div>
            <div className="py-10 text-center">
              <div className="w-16 h-16 bg-metal-800/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-metal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-metal-200 mb-2">Fotografías no disponibles</h3>
              <p className="text-metal-500 text-sm max-w-sm mx-auto">
                La carga de fotografías será habilitada en una futura actualización. Puedes continuar sin fotos.
              </p>
            </div>
          </div>
          <div className="flex justify-between pt-6">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Atrás
            </Button>
            <Button onClick={() => setStep(3)} size="lg">
              Siguiente
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Date and Time */}
      {step === 3 && (
        <div className="animate-fade-in">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Fecha y Horario</h2>
              <p className="text-metal-400 text-sm mt-1">Selecciona cuándo quieres el servicio</p>
            </div>
            <div className="space-y-5">
              <Input
                label="Fecha *"
                type="date"
                value={form.scheduledDate}
                onChange={(e) =>
                  setForm({ ...form, scheduledDate: e.target.value, startTime: "", endTime: "" })
                }
                min={new Date().toISOString().split("T")[0]}
              />
              {form.scheduledDate && (
                <div>
                  {loadingAvailability ? (
                    <div className="flex flex-col items-center py-8">
                      <div className="relative">
                        <div className="w-8 h-8 border-2 border-metal-700 rounded-full" />
                        <div className="absolute inset-0 w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-metal-400 text-sm mt-3">Cargando disponibilidad...</p>
                    </div>
                  ) : availability && !availability.isWorkDay ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                      <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-yellow-300 text-sm">
                        Este día no es laboral. Selecciona otra fecha.
                      </p>
                    </div>
                  ) : availability?.isBlocked ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                      <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-yellow-300 text-sm">
                        Este día está bloqueado: {availability.blockDescription}
                      </p>
                    </div>
                  ) : availability && availability.slots.length > 0 ? (
                    <div>
                      <p className="text-sm text-metal-400 mb-3 font-medium">Horarios disponibles</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availability.slots.map((slot) => {
                          const isSelected = form.startTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              onClick={() => handleSlotSelect(slot)}
                              disabled={!slot.available}
                              className={`
                                py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200
                                ${isSelected
                                  ? "bg-accent text-white shadow-glow ring-1 ring-accent/50"
                                  : slot.available
                                  ? "bg-metal-900 border border-[var(--color-border)] text-metal-300 hover:border-metal-600 hover:text-white"
                                  : "bg-metal-900/50 border border-[var(--color-border)]/50 text-metal-700 cursor-not-allowed line-through"
                                }
                              `}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : availability ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                      <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-yellow-300 text-sm">
                        No hay horarios disponibles para esta fecha.
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between pt-6">
            <Button variant="ghost" onClick={() => setStep(2)}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Atrás
            </Button>
            <Button
              onClick={() => setStep(4)}
              disabled={!form.startTime}
              size="lg"
            >
              Siguiente
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Summary */}
      {step === 4 && (
        <div className="animate-fade-in">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Resumen de la solicitud</h2>
              <p className="text-metal-400 text-sm mt-1">Verifica la información antes de enviar</p>
            </div>
            <div className="space-y-0 divide-y divide-[var(--color-border)]">
              <div className="py-4 first:pt-0">
                <p className="text-xs font-medium text-metal-500 uppercase tracking-wider mb-1">Servicio</p>
                <p className="text-white font-medium">{selectedService?.name || "—"}</p>
              </div>
              <div className="py-4">
                <p className="text-xs font-medium text-metal-500 uppercase tracking-wider mb-1">Dirección</p>
                <p className="text-white">{form.locationAddress}</p>
                {form.locationReference && (
                  <p className="text-metal-400 text-sm mt-0.5">{form.locationReference}</p>
                )}
              </div>
              <div className="py-4">
                <p className="text-xs font-medium text-metal-500 uppercase tracking-wider mb-1">Fecha y hora</p>
                <p className="text-white">
                  {form.scheduledDate} a las {form.startTime}
                </p>
              </div>
              {form.conditionNotes && (
                <div className="py-4">
                  <p className="text-xs font-medium text-metal-500 uppercase tracking-wider mb-1">Condiciones</p>
                  <p className="text-metal-300 text-sm">{form.conditionNotes}</p>
                </div>
              )}
              <div className="py-4">
                <p className="text-xs font-medium text-metal-500 uppercase tracking-wider mb-2">Condiciones especiales</p>
                <div className="flex flex-wrap gap-2">
                  {form.hasHeightWork && (
                    <span className="text-xs bg-accent/10 text-accent border border-accent/20 px-2.5 py-1 rounded-lg font-medium">
                      Trabajo en altura
                    </span>
                  )}
                  {form.hasElectricRisk && (
                    <span className="text-xs bg-accent/10 text-accent border border-accent/20 px-2.5 py-1 rounded-lg font-medium">
                      Riesgo eléctrico
                    </span>
                  )}
                  {form.hasComplicatedAccess && (
                    <span className="text-xs bg-accent/10 text-accent border border-accent/20 px-2.5 py-1 rounded-lg font-medium">
                      Acceso complicado
                    </span>
                  )}
                  {form.hasSpecialConditions && (
                    <span className="text-xs bg-accent/10 text-accent border border-accent/20 px-2.5 py-1 rounded-lg font-medium">
                      Condiciones especiales
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-metal-900/60 border border-[var(--color-border)]/60 rounded-xl px-5 py-3.5 flex items-start gap-3">
            <svg className="w-4 h-4 text-metal-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-metal-400 text-xs leading-relaxed">
              Tu solicitud quedará en estado <span className="text-metal-300 font-medium">Pendiente</span> hasta que el administrador la revise y confirme.
            </p>
          </div>

          <div className="flex justify-between pt-6">
            <Button variant="ghost" onClick={() => setStep(3)}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Atrás
            </Button>
            <Button onClick={handleSubmit} loading={submitting} size="lg">
              {submitting ? "Enviando..." : "Enviar Solicitud"}
              {!submitting && (
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
