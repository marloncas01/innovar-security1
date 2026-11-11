export interface StorageProvider {
  name: string;
  upload(file: Buffer, fileName: string, mimeType: string): Promise<StorageResult>;
  delete(fileName: string): Promise<void>;
  getUrl(fileName: string): string;
}

export interface StorageResult {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}
