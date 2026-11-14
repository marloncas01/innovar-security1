import "server-only";
import prisma from "@/lib/prisma";
import { getPaymentReadiness } from "@/lib/payment-config";

export async function loadPaymentReadiness(amount: number | null | undefined) {
  const rows = await prisma.setting.findMany({ where: { key: { in: ["payment_enabled", "payment_nequi_number", "payment_nequi_name", "payment_bancolombia_number", "payment_bancolombia_name", "payment_bancolombia_type"] } } });
  return getPaymentReadiness(Object.fromEntries(rows.map((row) => [row.key, row.value])), amount);
}
