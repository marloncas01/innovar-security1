"use client";
import { useState } from "react";

export default function AttentionForm() {
  const [kind, setKind] = useState("Consulta general");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const text = `Solicitud: ${kind}\nNombre: ${name.trim()}\nDetalle: ${message.trim()}`;
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setReady(true);
      }}
    >
      <div>
        <label htmlFor="attention-kind">Tipo de solicitud</label>
        <select
          id="attention-kind"
          value={kind}
          onChange={(event) => {
            setKind(event.target.value);
            setReady(false);
          }}
          className="legal-input"
        >
          {[
            "Consulta general",
            "Garantía o soporte",
            "Petición, queja o reclamo",
            "Retracto o devolución",
            "Consulta de datos personales",
            "Corrección o eliminación de datos",
          ].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="attention-name">Tu nombre</label>
        <input
          id="attention-name"
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
          className="legal-input"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setReady(false);
          }}
        />
      </div>
      <div>
        <label htmlFor="attention-message">Describe tu solicitud</label>
        <textarea
          id="attention-message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          className="legal-input"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            setReady(false);
          }}
        />
      </div>
      <p className="text-xs text-slate-400">
        Incluye el número de cita o cotización si lo tienes. No adjuntes
        contraseñas, códigos, datos bancarios completos ni documentos de
        identidad en este formulario.
      </p>
      <label className="flex gap-3 text-sm">
        <input type="checkbox" required onChange={() => setReady(false)} />
        Autorizo el uso de estos datos para gestionar mi solicitud según la
        política de privacidad.
      </label>
      <button
        className="rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 font-semibold"
        type="submit"
      >
        Preparar solicitud
      </button>
      {ready && (
        <div
          role="status"
          className="rounded-xl border border-cyan-300/30 p-5 space-y-4"
        >
          <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
          <a
            className="text-cyan-300 underline font-semibold"
            href={`https://wa.me/573044451436?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Revisar y enviar por WhatsApp ↗
          </a>
          <p className="text-xs text-slate-400">
            Aún no se ha enviado ni radicado. Completa el envío en WhatsApp y
            solicita confirmación de recepción. Guarda la conversación como
            soporte.
          </p>
        </div>
      )}
    </form>
  );
}
