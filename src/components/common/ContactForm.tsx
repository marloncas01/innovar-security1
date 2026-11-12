"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const text = `Hola, soy ${name.trim()}. ${message.trim()}`;

  return (
    <form className="space-y-4 mb-8" onSubmit={(event) => { event.preventDefault(); setReady(true); }}>
      <p className="text-sm text-metal-400">Solicita una cotización sin crear cuenta. Prepararemos tu mensaje para que lo revises y envíes por WhatsApp.</p>
      <div>
        <label htmlFor="contact-name" className="block text-sm text-metal-200 mb-2">Nombre</label>
        <input id="contact-name" autoComplete="name" required maxLength={100} value={name} onChange={(event) => { setName(event.target.value); setReady(false); }} className="w-full rounded-lg bg-black border border-border p-3 text-white" />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm text-metal-200 mb-2">¿Qué necesitas?</label>
        <textarea id="contact-message" required minLength={10} maxLength={1500} rows={4} value={message} onChange={(event) => { setMessage(event.target.value); setReady(false); }} className="w-full rounded-lg bg-black border border-border p-3 text-white" />
      </div>
      <div className="flex items-start gap-2 text-sm text-metal-300">
        <input id="contact-consent" type="checkbox" required checked={accepted} onChange={(event) => { setAccepted(event.target.checked); setReady(false); }} className="mt-1" />
        <label htmlFor="contact-consent">Autorizo el tratamiento de mis datos para responder a esta consulta según la <a href="/privacidad" target="_blank" className="text-accent underline">Política de Privacidad</a>.</label>
      </div>
      <button type="submit" className="w-full rounded-lg bg-accent hover:bg-accent-dark text-white font-semibold p-3">Preparar consulta</button>
      {ready && accepted && (
        <div role="status" className="rounded-lg border border-border p-4 space-y-3">
          <p className="text-sm text-metal-200 whitespace-pre-wrap break-words">{text}</p>
          <a href={`https://wa.me/573044451436?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="inline-block text-accent underline font-semibold">Continuar en WhatsApp</a>
          <p className="text-xs text-metal-400">Tu consulta aún no se ha enviado. Completa el envío en WhatsApp.</p>
        </div>
      )}
    </form>
  );
}
