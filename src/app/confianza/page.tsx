import Link from "next/link";
import type { Metadata } from "next";
import LegalShell from "@/components/common/LegalShell";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Centro de confianza",
  alternates: { canonical: "/confianza" },
};
export default function Page() {
  return (
    <LegalShell
      title="Tecnología con claridad."
      intro="Antes de compartir tus datos o contratar, conoce cómo funciona Innovar Security y dónde encontrar la información que necesitas."
    >
      <section>
        <h2>Tú decides, con información</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            [
              "/privacidad",
              "Tus datos",
              "Finalidades, derechos y canales de atención.",
            ],
            [
              "/terminos",
              "Tu servicio",
              "Cotizaciones, agenda, pagos y derechos del consumidor.",
            ],
            [
              "/cookies",
              "Tu navegador",
              "Cookies de sesión y almacenamiento esencial.",
            ],
            [
              "/atencion",
              "Tu voz",
              "Soporte, garantías, peticiones y reclamos.",
            ],
          ].map(([href, title, detail]) => (
            <Link
              key={href}
              href={href}
              className="solution-card block hover:border-cyan-300/60"
            >
              <h3 className="text-xl text-white mb-2">{title} ↗</h3>
              <p className="text-sm">{detail}</p>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2>Antes de contratar</h2>
        <ul>
          <li>Verifica la identidad del prestador y sus datos de contacto.</li>
          <li>
            Solicita una cotización con alcance, valor total, impuestos y
            posibles desplazamientos.
          </li>
          <li>
            Confirma fecha, condiciones de instalación, garantía y soporte.
          </li>
          <li>
            Comprueba el destinatario de cualquier transferencia y conserva sus
            soportes.
          </li>
        </ul>
      </section>
      <section>
        <h2>Lo que muestra este sitio</h2>
        <p>
          Las vistas de seguridad de la página de inicio son ilustrativas. No
          representan cámaras conectadas ni una central de monitoreo. Las
          recomendaciones son orientativas y deben validarse en la evaluación
          técnica. No se publican certificaciones, testimonios o cifras de
          clientes sin respaldo.
        </p>
      </section>
    </LegalShell>
  );
}
