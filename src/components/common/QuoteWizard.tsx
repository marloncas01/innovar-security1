"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  QuoteRequest,
  quoteAreas,
  quoteQuantities,
  quoteRequestSchema,
  quoteRequestText,
  quoteServices,
  quoteSpaces,
} from "@/lib/quote-request";

function Choices({
  legend,
  options,
  value,
  onChange,
  name,
}: {
  legend: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  name: string;
}) {
  return (
    <fieldset>
      <legend className="font-semibold text-lg mb-4">{legend}</legend>
      <div className="grid sm:grid-cols-2 gap-3">
        {options.map((option, index) => (
          <label
            key={option}
            className={`quote-choice ${value === option ? "quote-choice-active" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="accent-cyan-300"
            />
            <span>
              <span className="block text-xs font-mono text-slate-400 mb-1">
                0{index + 1}
              </span>
              {option}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function QuoteWizard({
  initialService,
}: {
  initialService: QuoteRequest["service"];
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuoteRequest>({
    space: "Hogar",
    service: initialService,
    areas: [],
    quantity: "Por definir",
    municipality: "",
    notes: "",
  });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus();
  }, [step]);
  const update = <K extends keyof QuoteRequest>(
    key: K,
    value: QuoteRequest[K],
  ) => {
    setData((previous) => ({ ...previous, [key]: value }));
    setConsent(false);
    setError("");
    setStatus("");
  };
  const move = (next: number) => {
    setStep(next);
    setError("");
    setStatus("");
  };
  const summary = quoteRequestSchema.safeParse(data).success
    ? quoteRequestText(data)
    : "";
  const steps = ["Tu espacio", "Los detalles", "Tu resumen"];
  return (
    <div className="quote-workspace">
      <aside className="quote-aside">
        <p className="text-cyan-300 uppercase tracking-[.2em] text-xs mb-5">
          Diseñemos el siguiente paso
        </p>
        <h1 className="text-3xl sm:text-4xl tracking-tight font-semibold leading-tight">
          Una solución
          <br />
          <span className="text-slate-400">empieza contigo.</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed mt-5">
          Cuéntanos qué buscas. Prepara tu solicitud, revísala y elige cuándo
          compartirla.
        </p>
        <ol className="mt-9 flex flex-col gap-5" aria-label="Pasos del cotizador">
          {steps.map((label, index) => (
            <li
              key={label}
              aria-current={step === index ? "step" : undefined}
              className={`flex gap-3 items-center text-sm ${step === index ? "text-cyan-200" : "text-slate-400"}`}
            >
              <span
                className={`quote-step ${step >= index ? "quote-step-active" : ""}`}
              >
                {index < step ? "✓" : index + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
        <p className="border-t border-white/10 mt-8 pt-5 text-xs text-slate-400">
          Sin registro · Sin pagos en este formulario
          <br />
          El valor se define después de la evaluación.
        </p>
      </aside>
      <div className="quote-form-panel">
        <p className="text-xs text-cyan-300 uppercase tracking-widest mb-3">
          Paso {step + 1} de 3
        </p>
        <h2
          ref={heading}
          tabIndex={-1}
          className="text-2xl font-semibold tracking-tight mb-7"
        >
          {
            [
              "¿Qué quieres mejorar?",
              "Conozcamos un poco más.",
              "Listo para dar el siguiente paso.",
            ][step]
          }
        </h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (step === 1) {
              const parsed = quoteRequestSchema.safeParse(data);
              if (!parsed.success) {
                setError(parsed.error.issues[0].message);
                return;
              }
              setData(parsed.data);
            }
            move(Math.min(step + 1, 2));
          }}
        >
          {step === 0 && (
            <div className="space-y-8">
              <Choices
                legend="¿Qué espacio tienes en mente?"
                options={quoteSpaces}
                value={data.space}
                onChange={(value) =>
                  update("space", value as QuoteRequest["space"])
                }
                name="space"
              />
              <Choices
                legend="¿En qué podemos ayudarte?"
                options={quoteServices}
                value={data.service}
                onChange={(value) =>
                  update("service", value as QuoteRequest["service"])
                }
                name="service"
              />
            </div>
          )}
          {step === 1 && (
            <div className="space-y-7">
              <fieldset>
                <legend className="font-semibold mb-3">
                  ¿Qué zonas quieres evaluar?
                </legend>
                <div className="grid sm:grid-cols-2 gap-3">
                  {quoteAreas.map((area) => (
                    <label
                      key={area}
                      className="flex gap-3 items-center text-sm p-3 border border-slate-700 rounded-xl"
                    >
                      <input
                        type="checkbox"
                        className="accent-cyan-300"
                        checked={data.areas.includes(area)}
                        onChange={(event) =>
                          update(
                            "areas",
                            event.target.checked
                              ? area === "Necesito orientación"
                                ? [area]
                                : [
                                    ...data.areas.filter(
                                      (item) => item !== "Necesito orientación",
                                    ),
                                    area,
                                  ]
                              : data.areas.filter((item) => item !== area),
                          )
                        }
                      />
                      {area}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <label
                  htmlFor="quote-quantity"
                  className="text-sm font-semibold"
                >
                  ¿Cuántas cámaras estás considerando?
                </label>
                <select
                  id="quote-quantity"
                  className="legal-input"
                  value={data.quantity}
                  onChange={(event) =>
                    update(
                      "quantity",
                      event.target.value as QuoteRequest["quantity"],
                    )
                  }
                >
                  {quoteQuantities.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-2">
                  Es una referencia inicial; puedes dejarla por definir.
                </p>
              </div>
              <div>
                <label
                  htmlFor="quote-municipality"
                  className="text-sm font-semibold"
                >
                  Municipio *
                </label>
                <input
                  id="quote-municipality"
                  className="legal-input"
                  value={data.municipality}
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="address-level2"
                  placeholder="Ej. Fómeque"
                  onChange={(event) =>
                    update("municipality", event.target.value)
                  }
                />
                <p className="text-xs text-slate-400 mt-2">
                  La cobertura y los desplazamientos deben confirmarse con el
                  equipo.
                </p>
              </div>
              <div>
                <label htmlFor="quote-notes" className="text-sm font-semibold">
                  ¿Algo más que debamos saber?{" "}
                  <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  id="quote-notes"
                  className="legal-input"
                  rows={3}
                  maxLength={800}
                  value={data.notes}
                  placeholder="Ej. Tengo dos cámaras que dejaron de mostrar imagen."
                  onChange={(event) => update("notes", event.target.value)}
                />
                <p className="text-xs text-slate-400 mt-2">
                  {data.notes.length}/800 · No incluyas contraseñas, documentos
                  ni la dirección exacta.
                </p>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <p className="text-sm text-slate-300 mb-5">
                Este resumen se preparó en tu navegador. Todavía no se ha
                enviado ni registrado como cita.
              </p>
              <div className="rounded-2xl border border-slate-700 bg-black/20 p-5">
                <dl className="grid sm:grid-cols-2 gap-5 text-sm">
                  {[
                    ["Espacio", data.space],
                    ["Servicio", data.service],
                    ["Zonas", data.areas.join(", ")],
                    ["Cámaras", data.quantity],
                    ["Municipio", data.municipality],
                    ["Detalles", data.notes || "Sin detalles adicionales"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-slate-400 mb-1">{label}</dt>
                      <dd className="break-words whitespace-pre-wrap">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-wrap gap-4 mt-5 text-sm">
                  <button
                    type="button"
                    onClick={() => move(0)}
                    className="text-cyan-300 underline"
                  >
                    Editar necesidad
                  </button>
                  <button
                    type="button"
                    onClick={() => move(1)}
                    className="text-cyan-300 underline"
                  >
                    Editar detalles
                  </button>
                </div>
              </div>
              <div className="mt-5 p-4 rounded-xl bg-cyan-300/5 border border-cyan-300/20">
                <p className="font-semibold text-sm text-cyan-200">
                  ¿Qué pasa después?
                </p>
                <p className="text-sm text-slate-300 mt-2">
                  El equipo confirma cobertura, revisa tus necesidades y te
                  indica si hace falta una visita. Solicita una propuesta con
                  alcance, precio total, garantía y tiempos antes de aceptar.
                </p>
              </div>
              <label className="flex gap-3 text-sm text-slate-300 my-6">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-1 accent-cyan-300"
                />
                <span>
                  Autorizo el uso de esta información para atender mi solicitud
                  según la{" "}
                  <Link
                    href="/privacidad"
                    target="_blank"
                    className="text-cyan-300 underline"
                  >
                    política de datos
                  </Link>
                  . Al continuar se abrirá WhatsApp.
                </span>
              </label>
              {consent ? (
                <a
                  href={`https://wa.me/573044451436?text=${encodeURIComponent(summary)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="quote-primary w-full justify-center"
                >
                  Revisar y enviar por WhatsApp ↗
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="quote-primary w-full justify-center opacity-40 cursor-not-allowed"
                >
                  Autoriza para continuar en WhatsApp
                </button>
              )}
              <p className="text-xs text-slate-400 mt-3">
                El envío se completa en WhatsApp. Este formulario no fija
                precios ni confirma disponibilidad.
              </p>
              <div className="flex flex-wrap gap-4 mt-6 text-sm">
                <button
                  type="button"
                  className="quote-secondary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(summary);
                      setStatus("Resumen copiado.");
                    } catch {
                      setError(
                        "No pudimos copiar el resumen. Puedes descargarlo como archivo.",
                      );
                    }
                  }}
                >
                  Copiar resumen
                </button>
                <button
                  type="button"
                  className="quote-secondary"
                  onClick={() => {
                    const blob = new Blob(["\uFEFF" + summary], {
                      type: "text/plain;charset=utf-8",
                    });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "solicitud-innovar-security.txt";
                    link.click();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                    setStatus("Descarga del resumen iniciada.");
                  }}
                >
                  Descargar resumen
                </button>
              </div>
            </div>
          )}
          {error && (
            <p role="alert" className="text-red-300 text-sm mt-5">
              {error}
            </p>
          )}
          {status && (
            <p role="status" className="text-emerald-300 text-sm mt-5">
              {status}
            </p>
          )}
          {step < 2 && (
            <div className="flex gap-3 justify-between border-t border-white/10 mt-8 pt-6">
              {step > 0 ? (
                <button
                  type="button"
                  className="quote-secondary"
                  onClick={() => move(step - 1)}
                >
                  ← Volver
                </button>
              ) : (
                <Link href="/servicios" className="quote-secondary">
                  Ver servicios
                </Link>
              )}
              <button type="submit" className="quote-primary">
                {step === 1 ? "Preparar resumen" : "Continuar"} →
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
