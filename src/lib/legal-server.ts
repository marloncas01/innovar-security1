import "server-only";
import prisma from "@/lib/prisma";
import { legalFields } from "@/lib/legal";

export async function getLegalIdentity() {
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: legalFields.map((field) => field.key) } },
    });
    return Object.fromEntries(
      rows.map((row) => [row.key, row.value.trim()]),
    ) as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
}
