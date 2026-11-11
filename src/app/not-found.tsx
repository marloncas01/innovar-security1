import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-primary-950 text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-metal-400 mb-8">Página no encontrada</p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    </main>
  );
}
