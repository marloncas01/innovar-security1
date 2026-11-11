import { StorageProvider, StorageResult } from "./types";
import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "citas");

export class LocalStorageProvider implements StorageProvider {
  name = "local";

  async upload(file: Buffer, fileName: string, mimeType: string): Promise<StorageResult> {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.writeFile(filePath, file);
    return {
      url: `/uploads/citas/${fileName}`,
      fileName,
      fileSize: file.length,
      mimeType,
    };
  }

  async delete(fileName: string): Promise<void> {
    const filePath = path.join(UPLOAD_DIR, fileName);
    try {
      await fs.unlink(filePath);
    } catch {
      // File may not exist
    }
  }

  getUrl(fileName: string): string {
    return `/uploads/citas/${fileName}`;
  }
}
