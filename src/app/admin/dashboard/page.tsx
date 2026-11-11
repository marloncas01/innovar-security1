"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Appointment {
  id: string;
  status: string;
  scheduledDate: string;
  service: { name: string };
  client: { name: string; phone?: string };
}

interface Stats {
  pending: number;
  confirmed: number;
  total: number;
  unreadNotifications: number;
  totalClients: number;
  activeServices: number;
  pendingQuotes: number;
  pendingPayments: number;
  totalRevenue: number;
  recentActivity: Appointment[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    confirmed: 0,
    total: 0,
    unreadNotifications: 0,
    totalClients: 0,
    activeServices: 0,
    pendingQuotes: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    recentActivity: [],
  });
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [citasRes, notifRes, statsRes] = await Promise.all([
          fetch("/api/admin/citas?limit=100"),
          fetch("/api/admin/notifications?limit=1"),
          fetch("/api/admin/dashboard/stats"),
        ]);

        if (!citasRes.ok) throw new Error();

        const citasData = await citasRes.json();
        const appointments: Appointment[] = citasData.appointments || [];

        const pending = appointments.filter(
          (a) => a.status === "PENDING"
        ).length;
        const confirmed = appointments.filter(
          (a) => a.status === "CONFIRMED"
        ).length;
        const total = citasData.pagination?.total ?? appointments.length;

        let unreadNotifications = 0;
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          unreadNotifications = notifData.unreadCount || 0;
        }

        let totalClients = 0;
        let activeServices = 0;
        let pendingQuotes = 0;
        let pendingPayments = 0;
        let totalRevenue = 0;
        let recentActivity: Appointment[] = [];

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          totalClients = statsData.totalClients || 0;
          activeServices = statsData.activeServices || 0;
          pendingQuotes = statsData.pendingQuotes || 0;
          pendingPayments = statsData.pendingPayments || 0;
          totalRevenue = statsData.totalRevenue || 0;
          recentActivity = statsData.recentActivity || [];
        }

        setStats({
          pending,
          confirmed,
          total,
          unreadNotifications,
          totalClients,
          activeServices,
          pendingQuotes,
          pendingPayments,
          totalRevenue,
          recentActivity,
        });

        const now = new Date();
        const next5 = appointments
          .filter(
            (a) =>
              a.status === "CONFIRMED" &&
              new Date(a.scheduledDate) >= now
          )
          .sort(
            (a, b) =>
              new Date(a.scheduledDate).getTime() -
              new Date(b.scheduledDate).getTime()
          )
          .slice(0, 5);
        setUpcoming(next5);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-metal-400 text-sm">
          No se pudieron cargar los datos
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-metal-400 mt-1">Resumen de tu negocio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <p className="text-sm text-metal-400 mb-1">Citas pendientes</p>
          <p className="text-2xl font-bold text-amber-400">
            {stats.pending}
          </p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <p className="text-sm text-metal-400 mb-1">
            Citas confirmadas
          </p>
          <p className="text-2xl font-bold text-emerald-400">
            {stats.confirmed}
          </p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <p className="text-sm text-metal-400 mb-1">Clientes</p>
          <p className="text-2xl font-bold text-blue-400">
            {stats.totalClients}
          </p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <p className="text-sm text-metal-400 mb-1">Servicios activos</p>
          <p className="text-2xl font-bold text-purple-400">
            {stats.activeServices}
          </p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <p className="text-sm text-metal-400 mb-1">Ingresos totales</p>
          <p className="text-2xl font-bold text-emerald-400">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <p className="text-sm text-metal-400 mb-1">Cotizaciones pendientes</p>
          <p className="text-2xl font-bold text-orange-400">
            {stats.pendingQuotes}
          </p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <p className="text-sm text-metal-400 mb-1">Pagos pendientes</p>
          <p className="text-2xl font-bold text-red-400">
            {stats.pendingPayments}
          </p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <p className="text-sm text-metal-400 mb-1">Notificaciones sin leer</p>
          <p className="text-2xl font-bold text-blue-400">
            {stats.unreadNotifications}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/admin/citas"
            className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:border-blue-500 hover:bg-blue-500/5 transition-colors"
          >
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm font-medium text-metal-200">
              Gestionar Citas
            </span>
          </Link>
          <Link
            href="/admin/clientes"
            className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:border-blue-500 hover:bg-blue-500/5 transition-colors"
          >
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span className="text-sm font-medium text-metal-200">
              Ver Clientes
            </span>
          </Link>
          <Link
            href="/admin/configuracion"
            className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:border-blue-500 hover:bg-blue-500/5 transition-colors"
          >
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm font-medium text-metal-200">
              Configuración
            </span>
          </Link>
          <Link
            href="/admin/notificaciones"
            className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:border-blue-500 hover:bg-blue-500/5 transition-colors"
          >
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="text-sm font-medium text-metal-200">
              Notificaciones
            </span>
          </Link>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Próximas Citas
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-metal-500 text-sm">No hay citas próximas</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)]"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {appointment.client?.name || "Cliente"}
                  </p>
                  <p className="text-xs text-metal-400">
                    {appointment.service?.name || "Servicio"}
                  </p>
                </div>
                <span className="text-xs text-metal-400">
                  {formatDate(appointment.scheduledDate)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Actividad Reciente
          </h2>
          {stats.recentActivity.length === 0 ? (
            <p className="text-metal-500 text-sm">No hay actividad reciente</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.status === "CONFIRMED"
                          ? "bg-emerald-400"
                          : activity.status === "PENDING"
                          ? "bg-amber-400"
                          : activity.status === "COMPLETED"
                          ? "bg-blue-400"
                          : "bg-metal-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {activity.client?.name || "Cliente"}
                      </p>
                      <p className="text-xs text-metal-400">
                        {activity.service?.name || "Servicio"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        activity.status === "CONFIRMED"
                          ? "bg-emerald-400/10 text-emerald-400"
                          : activity.status === "PENDING"
                          ? "bg-amber-400/10 text-amber-400"
                          : activity.status === "COMPLETED"
                          ? "bg-blue-400/10 text-blue-400"
                          : "bg-metal-500/10 text-metal-400"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Quotes & Payments */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Resumen Financiero
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-400/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Cotizaciones pendientes</p>
                  <p className="text-xs text-metal-400">Esperando aprobación</p>
                </div>
              </div>
              <p className="text-xl font-bold text-orange-400">{stats.pendingQuotes}</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-400/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Pagos pendientes</p>
                  <p className="text-xs text-metal-400">Por confirmar recepción</p>
                </div>
              </div>
              <p className="text-xl font-bold text-red-400">{stats.pendingPayments}</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Ingresos confirmados</p>
                  <p className="text-xs text-metal-400">Total recaudado</p>
                </div>
              </div>
              <p className="text-xl font-bold text-emerald-400">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
