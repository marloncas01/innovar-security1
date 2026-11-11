import { StorageProvider } from "./types";
import { LocalStorageProvider } from "./local";

let provider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (provider) return provider;

  const storageType = process.env.STORAGE_PROVIDER || "local";

  switch (storageType) {
    case "local":
    default:
      provider = new LocalStorageProvider();
      break;
      // Future: case "s3": provider = new S3StorageProvider(); break;
      // Future: case "cloudinary": provider = new CloudinaryStorageProvider(); break;
  }

  return provider;
}
