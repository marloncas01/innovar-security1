import { getLegalIdentity } from "@/lib/legal-server";
import { legalFields } from "@/lib/legal";

export default async function LegalIdentity() {
  const values = await getLegalIdentity();
  const complete = legalFields.every((field) => values[field.key]);
  return (
    <div className="legal-identity">
      <h2 className="text-lg font-semibold text-white mb-4">
        Identificación y contacto del prestador
      </h2>
      <dl className="grid sm:grid-cols-2 gap-5 text-sm">
        {legalFields.map((field) => (
          <div key={field.key}>
            <dt className="text-slate-400 mb-1">{field.label}</dt>
            <dd className="text-slate-200 break-words">
              {values[field.key] || "Pendiente de información del responsable"}
            </dd>
          </div>
        ))}
        <div>
          <dt className="text-slate-400 mb-1">
            Nombre comercial / zona de atención
          </dt>
          <dd>Innovar Security · Fómeque, Cundinamarca</dd>
        </div>
        <div>
          <dt className="text-slate-400 mb-1">Canal de contacto disponible</dt>
          <dd>
            <a className="underline text-cyan-300" href="tel:+573044451436">
              304 445 1436
            </a>
          </dd>
        </div>
      </dl>
      {!complete && (
        <p className="mt-5 text-sm text-amber-200 border-t border-white/10 pt-4">
          Información legal en proceso de completar. Solicita los datos del
          prestador antes de contratar o realizar un pago.
        </p>
      )}
    </div>
  );
}
