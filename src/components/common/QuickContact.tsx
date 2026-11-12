"use client";

import { usePathname } from "next/navigation";
import { publicPages } from "@/lib/site";

export default function QuickContact() {
  const pathname = usePathname();
  if (!publicPages.includes(pathname)) return null;
  return (
    <a href="https://wa.me/573044451436?text=Hola%2C%20necesito%20asesor%C3%ADa%20sobre%20c%C3%A1maras%20de%20seguridad" target="_blank" rel="noopener noreferrer" aria-label="Pedir asesoría por WhatsApp, abre una nueva pestaña" className="fixed right-4 bottom-5 sm:right-6 z-40 inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 shadow-xl border border-white/15 min-h-12">
      <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.95L3 21l1.95-5.5A9 9 0 0 1 4 11.5a8.5 8.5 0 0 1 17 0Z"/><path strokeLinecap="round" d="M8 10h8M8 14h5"/></svg>
      WhatsApp
    </a>
  );
}
