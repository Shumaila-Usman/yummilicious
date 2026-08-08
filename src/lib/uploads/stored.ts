import { randomBytes } from "crypto";
import { connectDB } from "@/lib/db/connect";
import { StoredUpload } from "@/models/StoredUpload";
import {
  normalizeUploadFolder,
  publicUploadUrl,
  parseStoredUploadUrl,
  type UploadFolder,
} from "@/lib/uploads/types";

export {
  UPLOAD_FOLDERS,
  normalizeUploadFolder,
  publicUploadUrl,
  parseStoredUploadUrl,
  resolveMediaUrl,
  type UploadFolder,
} from "@/lib/uploads/types";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 8 * 1024 * 1024;

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function isAllowedUploadMime(mime: string) {
  return ALLOWED_MIME.has(mime);
}

export function assertUploadConstraints(mimeType: string, size: number) {
  if (!isAllowedUploadMime(mimeType)) {
    throw new Error("Only JPG, PNG, WEBP, or GIF images are allowed.");
  }
  if (size > MAX_BYTES) {
    throw new Error("Image must be under 8MB.");
  }
}

export function buildUploadFilename(mimeType: string) {
  const ext = MIME_EXT[mimeType] || "jpg";
  return `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
}

export async function deleteStoredUploadByUrl(url?: string | null): Promise<boolean> {
  const parsed = parseStoredUploadUrl(url);
  if (!parsed) return false;
  await connectDB();
  const result = await StoredUpload.deleteOne({
    folder: parsed.folder,
    filename: parsed.filename,
  });
  return result.deletedCount > 0;
}

export async function saveStoredUpload(input: {
  buffer: Buffer;
  mimeType: string;
  folder?: string | null;
}) {
  const mimeType = input.mimeType || "image/jpeg";
  assertUploadConstraints(mimeType, input.buffer.length);
  const folder: UploadFolder = normalizeUploadFolder(input.folder);
  const filename = buildUploadFilename(mimeType);

  await connectDB();
  await StoredUpload.create({
    folder,
    filename,
    mimeType,
    size: input.buffer.length,
    data: input.buffer,
  });

  return {
    success: true as const,
    url: publicUploadUrl(folder, filename),
    filename,
    size: input.buffer.length,
    folder,
    mimeType,
  };
}
