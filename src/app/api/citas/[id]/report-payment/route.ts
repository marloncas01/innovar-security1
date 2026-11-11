import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { client: true, payment: true, service: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && appointment.client.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const formData = await request.formData();
    const method = (formData.get("method") as string) || "NEQUI";
    const reference = (formData.get("reference") as string) || "";
    const notes = (formData.get("notes") as string) || "";
    const receiptFile = formData.get("receipt") as File | null;

    let receiptUrl: string | null = null;
    if (receiptFile && receiptFile.size > 0) {
      const storage = getStorageProvider();
      const buffer = Buffer.from(await receiptFile.arrayBuffer());
      const ext = receiptFile.name.split(".").pop() || "jpg";
      const fileName = `receipt_${params.id}_${Date.now()}.${ext}`;
      const uploadResult = await storage.upload(buffer, fileName, receiptFile.type);
      receiptUrl = uploadResult.url;
    }

    const amount = appointment.service.price ?? 0;

    const payment = await prisma.payment.upsert({
      where: { appointmentId: params.id },
      update: {
        method,
        reference: reference.trim() || undefined,
        notes: notes ? (receiptUrl ? `${notes} | Comprobante: ${receiptUrl}` : notes) : receiptUrl ? `Comprobante: ${receiptUrl}` : undefined,
        status: "PROCESSING",
        updatedAt: new Date(),
      },
      create: {
        appointmentId: params.id,
        amount,
        currency: "COP",
        method,
        reference: reference.trim() || `MANUAL-${Date.now()}`,
        status: "PROCESSING",
        notes: notes ? (receiptUrl ? `${notes} | Comprobante: ${receiptUrl}` : notes) : receiptUrl ? `Comprobante: ${receiptUrl}` : undefined,
      },
    });

    // Registrar en historial de la cita
    await prisma.appointmentHistory.create({
      data: {
        appointmentId: params.id,
        action: "PAYMENT_REPORTED",
        details: `Cliente reportó pago vía ${method}. Referencia: ${reference || "N/A"}. Estado: En verificación por administrador.`,
        performedBy: session.user.name || session.user.email || "CLIENT",
      },
    });

    // Crear notificación para el administrador
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (adminUser) {
      await prisma.userNotification.create({
        data: {
          userId: adminUser.id,
          type: "PAYMENT_REPORTED",
          title: "Nuevo comprobante de pago reportado",
          message: `${appointment.client.name} reportó un pago de $${amount.toLocaleString("es-CO")} COP por ${method} para su cita de ${appointment.service.name}.`,
          appointmentId: appointment.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Pago reportado exitosamente. El administrador verificará la transacción para confirmar tu cita.",
      payment,
    });
  } catch (error: any) {
    console.error("Error reporting payment:", error);
    return NextResponse.json({ error: "Error al registrar el reporte de pago" }, { status: 500 });
  }
}
