import { PrismaClient } from "@prisma/client";

const prismaGlobal = globalThis as unknown as { prisma: PrismaClient };

const prisma = prismaGlobal.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

if (process.env.NODE_ENV !== "production") {
  prismaGlobal.prisma = prisma;
}

export default prisma;
