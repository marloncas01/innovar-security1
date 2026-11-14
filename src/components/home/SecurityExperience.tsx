"use client";

import { useState } from "react";

const spaces = {
  hogar: {
    label: "Mi hogar",
    title: "Tu tranquilidad empieza en casa.",
    detail:
      "Revisa accesos, entradas y zonas comunes. Te ayudamos a elegir la ubicación y el tipo de cámara según tu espacio.",
    zones: ["Acceso principal", "Patio o garaje", "Zonas comunes"],
  },
  negocio: {
    label: "Mi negocio",
    title: "Más claridad para tu operación.",
    detail:
      "Identifica entradas, caja y circulación. Diseñamos contigo una propuesta que respete la privacidad de clientes y colaboradores.",
    zones: ["Entrada del local", "Zona de caja", "Circulación"],
  },
  finca: {
    label: "Mi finca",
    title: "Una solución pensada para el entorno.",
    detail:
      "Evaluamos distancias, energía, conectividad y condiciones exteriores antes de recomendar equipos y puntos de instalación.",
    zones: ["Ingreso al predio", "Área exterior", "Conectividad"],
  },
};

export function SecurityVisual() {
  return (
    <div
      className="security-visual"
      aria-label="Ilustración de una propuesta de videovigilancia. No representa cámaras conectadas."
    >
      <div className="flex justify-between gap-3 text-xs text-slate-300">
        <span className="tracking-[.18em] uppercase">Innovar / visión</span>
        <span className="text-cyan-300">Concepto de instalación</span>
      </div>
      <div className="security-scene" aria-hidden="true">
        <div className="scene-grid" />
        <div className="scene-orbit" />
        <svg
          viewBox="0 0 420 290"
          className="relative w-full h-full"
          fill="none"
        >
          <path
            d="M55 226 210 145 367 226 210 278Z"
            fill="#0e263a"
            stroke="#256080"
          />
          <path
            d="m114 178 96-88 96 88v64l-96 50-96-50Z"
            fill="#0b162d"
            stroke="#549cbe"
          />
          <path d="m92 181 118-109 118 109" stroke="#67e8f9" strokeWidth="3" />
          <path d="M210 90v202m-96-114 96 50 96-50" stroke="#256080" />
          <path d="m241 192 36-19v49l-36 19Z" fill="#164e63" stroke="#67e8f9" />
          <path d="m145 188 34 18v29l-34-18Z" fill="#1e3a8a" stroke="#60a5fa" />
          <path d="m102 143 51 18 13-19-51-18Z" fill="#e2e8f0" />
          <circle cx="157" cy="151" r="7" fill="#06b6d4" />
          <path d="m159 158 84 84-169-25Z" fill="#22d3ee" opacity=".09" />
          <circle cx="317" cy="92" r="28" fill="#0f2741" stroke="#38bdf8" />
          <path d="m307 92 7 7 13-15" stroke="#67e8f9" strokeWidth="3" />
          <path d="M302 116 276 146" stroke="#38bdf8" strokeDasharray="4 5" />
        </svg>
        <span className="scene-label scene-label-one">01 / Accesos</span>
        <span className="scene-label scene-label-two">02 / Entorno</span>
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-5 text-xs text-slate-300">
        <span>Diseño a medida</span>
        <span>Instalación</span>
        <span>Orientación de uso</span>
      </div>
      <a href="#galeria" className="inline-flex mt-5 text-sm text-cyan-300 hover:underline gap-2">Explorar imágenes <span aria-hidden="true">↗</span></a>
      <p className="mt-4 text-[11px] text-slate-400">
        Vista ilustrativa · Sin conexión a cámaras en vivo
      </p>
    </div>
  );
}

export default function SecurityExperience() {
  const [space, setSpace] = useState<keyof typeof spaces>("hogar");
  const selected = spaces[space];
  return (
    <section className="experience-section" aria-labelledby="experience-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-cyan-300 text-xs uppercase tracking-[.22em] mb-4">
          Encuentra tu punto de partida
        </p>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start">
          <div>
            <h2
              id="experience-title"
              className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight"
            >
              Cada espacio merece
              <br />
              <span className="text-slate-400">su propia solución.</span>
            </h2>
            <p className="text-slate-400 mt-5 max-w-md">
              Explora una orientación inicial. La propuesta final se define
              después de conocer tus necesidades y las condiciones del lugar.
            </p>
            <div
              className="flex flex-wrap gap-2 mt-8"
              role="group"
              aria-label="Tipo de espacio"
            >
              {Object.entries(spaces).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={space === key}
                  onClick={() => setSpace(key as keyof typeof spaces)}
                  className={`space-choice ${space === key ? "space-choice-active" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="solution-card" aria-live="polite" aria-atomic="true">
            <span className="text-xs text-cyan-300 uppercase tracking-widest">
              {selected.label}
            </span>
            <h3 className="text-2xl font-semibold mt-4 mb-4">
              {selected.title}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {selected.detail}
            </p>
            <ul className="my-6 space-y-3">
              {selected.zones.map((zone, i) => (
                <li key={zone} className="flex gap-3 text-sm text-slate-200">
                  <span className="text-cyan-300 font-mono">0{i + 1}</span>
                  {zone}
                </li>
              ))}
            </ul>
            <a
              className="inline-flex items-center gap-3 text-cyan-300 font-semibold text-sm hover:underline"
              href={`https://wa.me/573044451436?text=${encodeURIComponent(`Hola, quiero asesoría de cámaras para ${selected.label.toLowerCase()}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Consultar esta solución <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
