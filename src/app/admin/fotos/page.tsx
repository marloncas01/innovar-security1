"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/layout/AdminLayout";
import StatusBadge from "@/components/ui/StatusBadge";

interface Appointment {
  id: string;
  status: string;
  scheduledDate: string;
  service: { name: string };
  client: { name: string };
  _count: { photos: number };
}

export default function AdminFotosPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/citas?status=COMPLETED&limit=50")
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data.appointments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Fotos</h1>
          <p className="text-metal-400 mt-1">
            Gestiona las fotos de las citas
          </p>
        </div>

        {/* Storage notice */}
        <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <h3 className="text-amber-300 font-medium mb-1">Almacenamiento de fotos requiere configuración de proveedor</h3>
              <p className="text-amber-300/70 text-sm">
                Para gestionar fotos, necesitas configurar un proveedor de almacenamiento (AWS S3, Cloudinary, etc.) en la configuración del sistema.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
            <svg className="w-12 h-12 text-metal-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
            </svg>
            <p className="text-metal-400 font-medium">No hay citas completadas</p>
            <p className="text-metal-500 text-sm mt-1">
              Las fotos se vincularán a citas que hayan sido completadas.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-white mb-4">Citas Completadas</h2>
            <div className="hidden md:block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Cliente</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Servicio</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Fecha</th>
                    <th className="text-left px-4 py-3 text-metal-400 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-[var(--color-border)] hover:bg-white/5">
                      <td className="px-4 py-3">
                        <Link href={`/admin/citas/${apt.id}`} className="text-white hover:text-accent transition-colors">
                          {apt.client.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-metal-300">{apt.service.name}</td>
                      <td className="px-4 py-3 text-metal-300 text-sm">{apt.scheduledDate}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={apt.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {appointments.map((apt) => (
                <Link
                  key={apt.id}
                  href={`/admin/citas/${apt.id}`}
                  className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-medium">{apt.client.name}</p>
                    <StatusBadge status={apt.status} />
                  </div>
                  <p className="text-metal-300 text-sm">{apt.service.name}</p>
                  <p className="text-metal-400 text-xs mt-1">{apt.scheduledDate}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
