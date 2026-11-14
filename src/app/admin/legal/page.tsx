"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { legalFields } from "@/lib/legal";
export default function Page() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    fetch("/api/admin/legal")
      .then(async (response) => {
        if (!response.ok) throw Error();
        setValues(await response.json());
      })
      .catch(() =>
        setError("No se pudieron cargar los datos. Recarga para reintentar."),
      )
      .finally(() => setLoading(false));
  }, []);
  const missing = legalFields.filter((field) => !values[field.key]?.trim());
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold mb-3">Preparar la entrega</h1>
      <p className="text-slate-400 mb-7">
        Completa datos verificables del prestador. Los cambios aparecerán en las
        páginas legales al guardar.
      </p>
      <div className="rounded-xl border border-amber-300/30 p-5 mb-7">
        <p className="text-amber-200">
          {missing.length
            ? `${missing.length} datos legales pendientes`
            : "Datos de identificación completos"}
        </p>
        <p className="text-sm text-slate-300 mt-2">
          Contacto informado: Yeison Fabián Rodríguez Ríos · 304 445 1436.
          Confirma la razón social de la empresa. Completar los campos no
          certifica el cumplimiento legal.
        </p>
      </div>
      {error && (
        <p role="alert" className="text-red-300 mb-4">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-emerald-300 mb-4">
          Datos guardados y publicados.
        </p>
      )}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            setError("");
            setSaved(false);
            try {
              const response = await fetch("/api/admin/legal", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
              });
              const data = await response.json();
              if (!response.ok) throw Error(data.error);
              setSaved(true);
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "No se pudo guardar",
              );
            } finally {
              setSaving(false);
            }
          }}
          className="space-y-5"
        >
          <fieldset
            disabled={saving || (!!error && Object.keys(values).length === 0)}
            className="space-y-5"
          >
            {legalFields.map((field) => (
              <div key={field.key}>
                <label htmlFor={field.key} className="text-sm text-slate-300">
                  {field.label}
                </label>
                <input
                  id={field.key}
                  type={field.key === "legal_email" ? "email" : "text"}
                  maxLength={300}
                  className="legal-input"
                  value={values[field.key] || ""}
                  onChange={(event) => {
                    setValues({ ...values, [field.key]: event.target.value });
                    setSaved(false);
                  }}
                />
              </div>
            ))}
            <button
              type="submit"
              className="bg-blue-600 rounded-xl px-6 py-3 font-semibold"
            >
              {saving ? "Guardando…" : "Guardar datos legales"}
            </button>
          </fieldset>
        </form>
      )}
      <div className="mt-10 solution-card">
        <h2 className="text-lg font-semibold mb-3">
          Antes de entregar al negocio
        </h2>
        <ul className="list-disc pl-5 text-sm text-slate-300 space-y-3">
          <li>Confirmar identidad, NIT, correo y dirección del prestador.</li>
          <li>
            Revisar los textos con el responsable y asesoría jurídica según la
            actividad.
          </li>
          <li>Publicar horarios, precios y condiciones de garantía reales.</li>
          <li>Verificar cuentas de pago antes de habilitar cobros.</li>
          <li>Sustituir el acceso temporal por el definitivo.</li>
          <li>
            Verificar correo de recuperación y copias de seguridad recuperables.
          </li>
          <li>
            Confirmar contratos con proveedores de datos, facturación y
            registros que correspondan al negocio.
          </li>
        </ul>
        <Link
          href="/confianza"
          className="text-cyan-300 underline inline-block mt-5"
        >
          Revisar páginas públicas ↗
        </Link>
      </div>
    </div>
  );
}
