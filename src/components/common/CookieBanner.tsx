"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "essential_only");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-metal-950/95 backdrop-blur-md border-t border-metal-800 shadow-2xl animate-fade-in">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 text-sm text-metal-300 max-w-4xl">
          <p className="font-semibold text-white flex items-center gap-2">
            <span>🍪</span> Política de Cookies y Protección de Datos
          </p>
          <p className="text-xs text-metal-400 leading-relaxed">
            Utilizamos cookies técnicas y esenciales para garantizar la seguridad de tus sesiones, procesar tus agendamientos de citas y proteger tus transacciones bajo la normativa colombiana de Habeas Data (Ley 1581 de 2012). Puedes consultar nuestra{" "}
            <Link href="/privacidad" className="text-accent hover:underline">
              Política de Privacidad
            </Link>{" "}
            y{" "}
            <Link href="/terminos" className="text-accent hover:underline">
              Términos de Servicio
            </Link>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleDecline}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-metal-400 hover:text-white bg-metal-900 border border-metal-700 rounded-lg transition-colors"
          >
            Solo Esenciales
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 sm:flex-none px-5 py-2 text-xs font-semibold text-white bg-accent hover:bg-accent-dark rounded-lg transition-all shadow-glow"
          >
            Aceptar Todo
          </button>
        </div>
      </div>
    </div>
  );
}
