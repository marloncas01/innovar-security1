"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try { setShow(!localStorage.getItem("cookie_notice_v2")); }
    catch { setShow(true); }
  }, []);

  const handleAccept = () => {
    try { localStorage.setItem("cookie_notice_v2", "understood"); } catch { /* Browser storage may be disabled. */ }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-metal-950/95 backdrop-blur-md border-t border-metal-800 shadow-2xl animate-fade-in">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 text-sm text-metal-300 max-w-4xl">
          <p className="font-semibold text-white flex items-center gap-2">
            Cookies esenciales
          </p>
          <p className="text-xs text-metal-400 leading-relaxed">
            Este sitio usa cookies para iniciar sesión y proteger tu cuenta. Esta versión no incorpora analítica ni publicidad opcional. Consulta los detalles en nuestra <Link href="/cookies" className="text-cyan-300 underline">información sobre cookies</Link>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleAccept}
            className="flex-1 sm:flex-none px-5 py-2 text-xs font-semibold text-white bg-accent hover:bg-accent-dark rounded-lg transition-all shadow-glow"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
