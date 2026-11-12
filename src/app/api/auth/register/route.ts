import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signUpSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const rateLimit = checkRateLimit("register:" + ip, 5, 60 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta más tarde." },
        { status: 429 }
      );
    }

    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("acceptedTerms" in body) || body.acceptedTerms !== true) {
      return NextResponse.json({ error: "Debes aceptar los términos y autorizar el tratamiento de tus datos" }, { status: 400 });
    }
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { name, email, phone, password } = parsed.data;

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 400 }
      );
    }

    // Crear usuario y cliente
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "CLIENT",
        phone,
        client: {
          create: {
            name,
            phone,
            email,
          },
        },
      },
      include: { client: true },
    });

    return NextResponse.json(
      {
        message: "Cuenta creada exitosamente",
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "La solicitud no tiene un formato válido" }, { status: 400 });
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 409 });
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "No podemos crear tu cuenta en este momento. Inténtalo más tarde o contáctanos por WhatsApp al 304 445 1436." },
      { status: 503 }
    );
  }
}
