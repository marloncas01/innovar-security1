import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const appointmentId = formData.get("appointmentId") as string;
    const description = formData.get("description") as string;
    const files = formData.getAll("photos") as File[];

    if (!appointmentId) {
      return NextResponse.json({ error: "appointmentId es requerido" }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se proporcionaron archivos" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { client: true, photos: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && appointment.client.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const maxPhotosSetting = await prisma.setting.findUnique({ where: { key: "max_photos_per_appointment" } });
    const maxPhotos = maxPhotosSetting ? parseInt(maxPhotosSetting.value) : 10;
    if (appointment.photos.length + files.length > maxPhotos) {
      return NextResponse.json(
        { error: `Máximo ${maxPhotos} fotos por cita. Actualmente tiene ${appointment.photos.length}.` },
        { status: 400 }
      );
    }

    const maxSizeSetting = await prisma.setting.findUnique({ where: { key: "upload_max_size" } });
    const maxSize = maxSizeSetting ? parseInt(maxSizeSetting.value) : MAX_FILE_SIZE;

    const storage = getStorageProvider();
    const createdPhotos = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Tipo de archivo no permitido: ${file.type}. Use JPG, PNG, WebP o GIF.` },
          { status: 400 }
        );
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json({ error: "Extensión no permitida" }, { status: 400 });
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `El archivo ${file.name} excede el tamaño máximo de ${Math.round(maxSize / 1024 / 1024)}MB.` },
          { status: 400 }
        );
      }

      const fileName = `${appointmentId}_${Date.now()}_${i}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await storage.upload(buffer, fileName, file.type);

      const photo = await prisma.photo.create({
        data: {
          appointmentId,
          url: result.url,
          description: description?.trim() || null,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          order: appointment.photos.length + i,
        },
      });

      createdPhotos.push(photo);
    }

    return NextResponse.json({ photos: createdPhotos }, { status: 201 });
  } catch (error) {
    console.error("Error uploading photos:", error);
    return NextResponse.json({ error: "Error al subir fotos" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get("appointmentId");

    if (!appointmentId) {
      return NextResponse.json({ error: "appointmentId es requerido" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { client: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && appointment.client.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const photos = await prisma.photo.findMany({
      where: { appointmentId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json({ error: "Error al obtener fotos" }, { status: 500 });
  }
}
