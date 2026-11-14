"use client";

import { useEffect, useState } from "react";
import { schedulesSchema, type ScheduleRow } from "@/lib/scheduling";

const days = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const fieldClass =
  "w-full rounded-lg border border-metal-700 bg-metal-900 p-2.5 text-white";

export default function HorariosPage() {
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/schedules");
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.schedules))
        throw new Error(data.error || "No se pudieron cargar los horarios");
      setRows(data.schedules);
      setDirty(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  function change(index: number, value: Partial<ScheduleRow>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...value } : row)),
    );
    setDirty(true);
    setSaved(false);
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaved(false);
    const parsed = schedulesSchema.safeParse(rows);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/admin/schedules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules: parsed.data }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "No se pudieron guardar los horarios");
      setRows(data.schedules);
      setDirty(false);
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error de conexión");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Horarios de atención</h1>
        <p className="mt-2 text-metal-400">
          Define los días y las franjas que quieres ofrecer para nuevas citas.
          Todas las horas corresponden a Colombia.
        </p>
      </div>
      <p className="rounded-xl border border-border bg-surface p-4 text-sm text-metal-300">
        Los cambios se publican al guardar. Las citas ya creadas conservan su
        fecha y hora. El intervalo indica cada cuánto puede comenzar una cita;
        la duración depende del servicio.
      </p>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 p-4 text-red-300"
        >
          {error}
          {loading ? null : (
            <button type="button" onClick={load} className="ml-3 underline">
              Recargar horarios
            </button>
          )}
        </div>
      )}
      {saved && (
        <p role="status" className="text-emerald-300">
          Horarios guardados correctamente.
        </p>
      )}
      {loading ? (
        <p role="status">Cargando horarios…</p>
      ) : (
        <form onSubmit={save} className="space-y-4">
          <fieldset disabled={saving} className="space-y-4 disabled:opacity-60">
            {rows.length === 0 && (
              <p className="py-8 text-center text-metal-400">
                Todavía no has publicado horarios. Añade una franja para
                comenzar.
              </p>
            )}
            {rows.map((row, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-surface p-4 grid grid-cols-2 lg:grid-cols-6 gap-4 items-end"
              >
                <label className="text-sm text-metal-300 col-span-2 lg:col-span-1">
                  Día
                  <select
                    aria-label={`Día de la franja ${index + 1}`}
                    value={row.dayOfWeek}
                    onChange={(event) =>
                      change(index, { dayOfWeek: Number(event.target.value) })
                    }
                    className={fieldClass}
                  >
                    {days.map((day, i) => (
                      <option key={day} value={i}>
                        {day}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-metal-300">
                  Desde
                  <input
                    type="time"
                    required
                    aria-label={`Inicio de la franja ${index + 1}`}
                    value={row.startTime}
                    onChange={(event) =>
                      change(index, { startTime: event.target.value })
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="text-sm text-metal-300">
                  Hasta
                  <input
                    type="time"
                    required
                    aria-label={`Fin de la franja ${index + 1}`}
                    value={row.endTime}
                    onChange={(event) =>
                      change(index, { endTime: event.target.value })
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="text-sm text-metal-300">
                  Intervalo
                  <select
                    aria-label={`Intervalo de la franja ${index + 1}`}
                    value={row.blockDuration}
                    onChange={(event) =>
                      change(index, {
                        blockDuration: Number(event.target.value),
                      })
                    }
                    className={fieldClass}
                  >
                    {[
                      15,
                      30,
                      45,
                      60,
                      90,
                      120,
                      180,
                      240,
                      ...([15, 30, 45, 60, 90, 120, 180, 240].includes(
                        row.blockDuration,
                      )
                        ? []
                        : [row.blockDuration]),
                    ].map((value) => (
                      <option key={value} value={value}>
                        {value} min
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 min-h-11 text-sm">
                  <input
                    type="checkbox"
                    checked={row.active}
                    onChange={(event) =>
                      change(index, { active: event.target.checked })
                    }
                  />
                  Publicada
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRows((current) => current.filter((_, i) => i !== index));
                    setDirty(true);
                    setSaved(false);
                  }}
                  className="min-h-11 text-sm text-red-300 underline"
                  aria-label={`Quitar franja ${index + 1}`}
                >
                  Quitar franja
                </button>
              </div>
            ))}
            {dirty && (
              <p role="status" className="text-sm text-amber-300">
                Tienes cambios sin guardar.
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={rows.length >= 28}
                onClick={() => {
                  setRows((current) => [
                    ...current,
                    {
                      dayOfWeek: 1,
                      startTime: "08:00",
                      endTime: "12:00",
                      blockDuration: 60,
                      active: true,
                    },
                  ]);
                  setDirty(true);
                  setSaved(false);
                }}
                className="rounded-lg border border-metal-600 px-5 py-3 disabled:opacity-50"
              >
                Añadir franja
              </button>
              <button
                type="submit"
                disabled={!dirty}
                className="rounded-lg bg-accent px-5 py-3 font-semibold disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Guardar horarios"}
              </button>
            </div>
          </fieldset>
        </form>
      )}
    </div>
  );
}
