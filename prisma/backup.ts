// Backup script para PostgreSQL
// Ejecutar con: npx tsx prisma/backup.ts
// O agregar a crontab: 0 2 * * * npx tsx prisma/backup.ts

import { execSync } from "child_process";
import { readdir, mkdir, writeFile, stat, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import prisma from "@/lib/prisma";

const BACKUP_DIR = process.env.PG_DUMP_PATH || "./backups";
const DB_URL = process.env.DATABASE_URL;
const MAX_BACKUPS = parseInt(process.env.MAX_BACKUPS || "7");

interface BackupInfo {
  timestamp: string;
  filename: string;
  size: number;
  path: string;
}

export async function createBackup(): Promise<BackupInfo> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `innovar_backup_${timestamp}.sql`;
  const filepath = join(BACKUP_DIR, filename);

  if (!existsSync(BACKUP_DIR)) {
    await mkdir(BACKUP_DIR, { recursive: true });
  }

  // Crear dump con pg_dump
  const dumpCommand = `pg_dump ${DB_URL} --file="${filepath}" --format=custom --no-password`;
  
  try {
    execSync(dumpCommand, { stdio: "pipe", timeout: 60000 });
    
    const stats = await stat(filepath);
    
    // Guardar metadata del backup
    const backupInfo: BackupInfo = {
      timestamp,
      filename,
      size: stats.size,
      path: filepath,
    };

    const metaPath = join(BACKUP_DIR, `${filename}.meta.json`);
    await writeFile(metaPath, JSON.stringify(backupInfo, null, 2));

    // Limpiar backups antiguos
    await cleanupBackups();

    console.log(`Backup creado: ${filepath} (${stats.size} bytes)`);
    return backupInfo;
  } catch (error) {
    console.error("Error creando backup:", error);
    throw error;
  }
}

export async function cleanupBackups(): Promise<void> {
  if (!existsSync(BACKUP_DIR)) return;
  
  const files = await readdir(BACKUP_DIR);
  const backupFiles = files
    .filter(f => f.startsWith("innovar_backup_") && f.endsWith(".sql"))
    .map(f => ({ name: f, path: join(BACKUP_DIR, f) }))
    .sort((a, b) => {
      const timeA = new Date(a.name.match(/innovar_backup_(.+)\.sql/)?.[1] || "").getTime();
      const timeB = new Date(b.name.match(/innovar_backup_(.+)\.sql/)?.[1] || "").getTime();
      return timeA - timeB;
    });

  // Eliminar backups antiguos si exceden el máximo
  if (backupFiles.length > MAX_BACKUPS) {
    const toDelete = backupFiles.slice(0, backupFiles.length - MAX_BACKUPS);
    for (const file of toDelete) {
      try {
        await unlink(file.path);
        const metaPath = `${file.path}.meta.json`;
        if (existsSync(metaPath)) await unlink(metaPath);
        console.log(`Backup antiguo eliminado: ${file.name}`);
      } catch (error) {
        console.error(`Error eliminando backup ${file.name}:`, error);
      }
    }
  }
}

export async function restoreBackup(filename: string): Promise<void> {
  const filepath = join(BACKUP_DIR, filename);
  const restoreCommand = `pg_restore ${DB_URL} --file="${filepath}" --no-password`;
  
  try {
    execSync(restoreCommand, { stdio: "pipe", timeout: 120000 });
    console.log(`Backup restaurado: ${filename}`);
  } catch (error) {
    console.error("Error restaurando backup:", error);
    throw error;
  }
}

// Función principal
async function main() {
  console.log("=== INNOVAR SECURITY - BACKUP SYSTEM ===");
  console.log(`Directorio de backups: ${BACKUP_DIR}`);
  
  try {
    const info = await createBackup();
    console.log("Backup completado exitosamente:", info);
  } catch (error) {
    console.error("Backup fallido:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
