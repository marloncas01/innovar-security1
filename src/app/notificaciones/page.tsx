"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ClientLayout from "@/components/layout/ClientLayout";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  appointmentId: string | null;
  readAt: string | null;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "hace un momento";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return m === 1 ? "hace 1 minuto" : `hace ${m} minutos`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return h === 1 ? "hace 1 hora" : `hace ${h} horas`;
  }
  const d = Math.floor(diff / 86400);
  return d === 1 ? "hace 1 día" : `hace ${d} días`;
}

function typeIcon(type: string) {
  const cls = "w-5 h-5 flex-shrink-0";
  if (type.includes("APPOINTMENT"))
    return (
      <svg className={`${cls} text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  if (type.includes("PAYMENT"))
    return (
      <svg className={`${cls} text-green-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    );
  if (type.includes("QUOTE"))
    return (
      <svg className={`${cls} text-amber-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  return (
    <svg className={`${cls} text-purple-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

export default function NotificacionesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(filter === "unread" && { unreadOnly: "true" }),
      });
      const res = await fetch(`/api/notifications?${params}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        setTotalPages(data.pagination.pages);
      }
    } catch {}
    setLoading(false);
  }, [page, filter]);

  useEffect(() => {
    if (status === "authenticated") fetchNotifications();
  }, [status, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {}
  };

  if (status === "loading" || status === "unauthenticated") return null;

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
            <p className="text-sm text-metal-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-accent hover:text-accent/80 transition-colors self-start"
            >
              Marcar todo como leído
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-5">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-accent/15 text-accent"
                  : "text-metal-400 hover:text-white hover:bg-metal-800"
              }`}
            >
              {f === "all" ? "Todas" : "Sin leer"}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 bg-accent/20 text-accent text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-metal-900 border border-metal-800 animate-pulse">
                <div className="w-5 h-5 rounded bg-metal-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-40 bg-metal-700 rounded" />
                  <div className="h-3 w-full bg-metal-800 rounded" />
                  <div className="h-2 w-24 bg-metal-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-metal-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-metal-400 text-lg font-medium">No tienes notificaciones</p>
            <p className="text-metal-600 text-sm mt-1">Aparecerán aquí cuando tengas novedades</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.readAt && markAsRead(n.id)}
                className={`group flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                  n.readAt
                    ? "bg-metal-900/50 border-metal-800 hover:border-metal-700"
                    : "bg-metal-900 border-accent/20 hover:border-accent/40"
                }`}
              >
                <div className="mt-0.5">{typeIcon(n.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm leading-snug truncate ${n.readAt ? "text-metal-300" : "text-white font-semibold"}`}>
                      {n.title}
                    </p>
                    {!n.readAt && (
                      <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-metal-400 mt-0.5 line-clamp-2">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-metal-500">{timeAgo(n.createdAt)}</span>
                    {n.appointmentId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/citas/${n.appointmentId}`);
                        }}
                        className="text-xs text-accent hover:text-accent/80 font-medium"
                      >
                        Ver cita
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm text-metal-400 hover:text-white hover:bg-metal-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-metal-500 px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm text-metal-400 hover:text-white hover:bg-metal-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
