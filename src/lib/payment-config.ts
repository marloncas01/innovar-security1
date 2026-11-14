export interface PaymentSettings {
  payment_enabled?: string;
  payment_nequi_number?: string;
  payment_nequi_name?: string;
  payment_bancolombia_number?: string;
  payment_bancolombia_name?: string;
  payment_bancolombia_type?: string;
}
export type ManualPaymentMethod = "NEQUI" | "BANCOLOMBIA";
export function getPaymentReadiness(settings: PaymentSettings, amount: number | null | undefined) {
  const methods: ManualPaymentMethod[] = [];
  if (/^\d{10}$/.test(settings.payment_nequi_number?.trim() || "") && settings.payment_nequi_name?.trim()) methods.push("NEQUI");
  if (/^\d{8,20}$/.test(settings.payment_bancolombia_number?.trim() || "") && settings.payment_bancolombia_name?.trim() && ["Ahorros", "Corriente"].includes(settings.payment_bancolombia_type || "")) methods.push("BANCOLOMBIA");
  const error = settings.payment_enabled !== "true" ? "Los pagos aún no están habilitados. Coordina los detalles con nuestro equipo." : !methods.length ? "Los datos de pago están pendientes de configuración. Contáctanos antes de transferir." : !Number.isFinite(amount) || !amount || amount <= 0 ? "El valor está pendiente de cotización. Confírmalo con nuestro equipo antes de pagar." : null;
  return { ready: !error, methods, error };
}
