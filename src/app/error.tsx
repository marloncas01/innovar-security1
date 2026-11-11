"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-primary-950 text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">Error</h1>
        <p className="text-xl text-metal-400 mb-8">{error.message || "Ocurrió un error inesperado"}</p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center px-6 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg transition-colors"
        >
          Reintentar
        </button>
        <br />
        <Link href="/" className="inline-block mt-4 text-accent hover:underline">
          Volver al Inicio
        </Link>
      </div>
    </main>
  );
}
