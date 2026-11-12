import { PrismaClient } from "@prisma/client";

const prismaGlobal = globalThis as unknown as { prisma: PrismaClient };

const prisma = prismaGlobal.prisma || new PrismaClient({
  ...(process.env.DATABASE_URL_POOLED ? { datasources: { db: { url: process.env.DATABASE_URL_POOLED } } } : {}),
  log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

if (process.env.NODE_ENV !== "production") {
  prismaGlobal.prisma = prisma;
}

export default prisma;
