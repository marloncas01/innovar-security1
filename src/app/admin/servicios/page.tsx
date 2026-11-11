"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  duration: number | null;
  requiresVisit: boolean;
  active: boolean;
  sortOrder: number;
  features: string;
  createdAt: string;
  _count: { appointments: number };
}

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function AdminServiciosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (showInactive) params.set("includeInactive", "true");

    fetch(`/api/admin/services?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [showInactive]);

  const toggleActive = async (service: Service) => {
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !service.active }),
      });
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, active: !s.active } : s))
        );
      }
    } catch (error) {
      console.error("Error toggling service:", error);
    }
  };

  const deleteService = async (service: Service) => {
    if (!confirm(`¿Eliminar "${service.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, { method: "DELETE" });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== service.id));
      } else {
        const data = await res.json();
        alert(data.error || "No se pudo eliminar");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Servicios</h1>
          <p className="text-metal-400 mt-1">
            Gestiona los servicios ofrecidos a clientes
          </p>
        </div>
        <Link
          href="/admin/servicios/nuevo"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Servicio
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setShowInactive(!showInactive)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            showInactive
              ? "bg-accent text-white"
              : "bg-[var(--color-surface)] text-metal-400 hover:text-white border border-[var(--color-border)]"
          }`}
        >
          {showInactive ? "Mostrando todos" : "Solo activos"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : services.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <svg className="w-12 h-12 text-metal-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25-2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <p className="text-metal-400 font-medium">No hay servicios</p>
          <p className="text-metal-500 text-sm mt-1">Crea el primer servicio para comenzar.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-4 py-3 text-metal-400 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 text-metal-400 font-medium">Precio</th>
                  <th className="text-left px-4 py-3 text-metal-400 font-medium">Duración</th>
                  <th className="text-left px-4 py-3 text-metal-400 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 text-metal-400 font-medium">Citas</th>
                  <th className="text-left px-4 py-3 text-metal-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b border-[var(--color-border)] hover:bg-white/5">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{service.name}</p>
                      {service.requiresVisit && (
                        <p className="text-accent text-xs mt-0.5">Requiere visita</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {service.price != null ? (
                        <span className="text-white font-medium">{formatCOP(service.price)}</span>
                      ) : (
                        <span className="text-metal-500 italic text-xs">Cotización</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-metal-300">
                      {service.duration ? `${service.duration} min` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={service.active ? "ACTIVE" : "INACTIVE"} />
                    </td>
                    <td className="px-4 py-3 text-metal-300">{service._count.appointments}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/servicios/${service.id}/editar`}
                          className="text-accent hover:text-accent-light text-sm"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => toggleActive(service)}
                          className={`text-sm ${service.active ? "text-amber-400 hover:text-amber-300" : "text-green-400 hover:text-green-300"}`}
                        >
                          {service.active ? "Desactivar" : "Activar"}
                        </button>
                        {service._count.appointments === 0 && (
                          <button
                            onClick={() => deleteService(service)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {services.map((service) => (
              <div key={service.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-medium">{service.name}</p>
                    {service.requiresVisit && (
                      <p className="text-accent text-xs">Requiere visita</p>
                    )}
                  </div>
                  <StatusBadge status={service.active ? "ACTIVE" : "INACTIVE"} />
                </div>
                <div className="flex items-center gap-3 text-sm text-metal-300 mb-3">
                  {service.price != null ? (
                    <span className="text-white font-medium">{formatCOP(service.price)}</span>
                  ) : (
                    <span className="text-metal-500 italic">Cotización</span>
                  )}
                  {service.duration && <span>{service.duration} min</span>}
                  <span>{service._count.appointments} citas</span>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/servicios/${service.id}/editar`}
                    className="text-accent hover:text-accent-light text-sm"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => toggleActive(service)}
                    className={`text-sm ${service.active ? "text-amber-400" : "text-green-400"}`}
                  >
                    {service.active ? "Desactivar" : "Activar"}
                  </button>
                  {service._count.appointments === 0 && (
                    <button
                      onClick={() => deleteService(service)}
                      className="text-red-400 text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
