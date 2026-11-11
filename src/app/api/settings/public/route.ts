import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "business_name",
            "business_phone",
            "business_email",
            "currency",
            "payment_enabled",
            "payment_nequi_number",
            "payment_nequi_name",
            "payment_bancolombia_type",
            "payment_bancolombia_number",
            "payment_bancolombia_name",
            "payment_instructions",
          ],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return NextResponse.json({ error: "Error al cargar configuración" }, { status: 500 });
  }
}
