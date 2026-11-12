import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getEmailProvider } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Si el correo está registrado, recibirás un enlace de recuperación." },
        { status: 200 }
      );
    }

    const rateLimit = checkRateLimit(`forgot-password:${email}`, 3, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Si el correo está registrado, recibirás un enlace de recuperación." },
        { status: 200 }
      );
    }

    const emailProvider = getEmailProvider();
    if (process.env.NODE_ENV === "production" && emailProvider.name === "console") {
      return NextResponse.json({ message: "La recuperación por correo no está disponible en este momento. Contáctanos por WhatsApp al 304 445 1436 para recibir ayuda." }, { status: 503 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: {
          email: normalizedEmail,
          token,
          expiresAt,
        },
      });

      const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/recuperar/${token}`;

      const sent = await emailProvider.send(
        normalizedEmail,
        "Recuperación de contraseña - Innovar Security",
        `<p>Has solicitado restablecer tu contraseña.</p><p>Tu enlace: ${resetUrl}</p><p>Este enlace expira en 1 hora.</p>`
      );

      if (!sent.success) throw new Error("No se pudo enviar el correo de recuperación");

      if (process.env.NODE_ENV === "development") {
        console.log(`[DEV] Password reset token for ${normalizedEmail}: ${token}`);
        console.log(`[DEV] Reset URL: ${resetUrl}`);
      }
    }

    return NextResponse.json({
      message: "Si el correo está registrado, recibirás un enlace de recuperación.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "No pudimos procesar tu solicitud. Inténtalo más tarde o contáctanos por WhatsApp al 304 445 1436." },
      { status: 503 }
    );
  }
}
