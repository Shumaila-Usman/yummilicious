export const UPLOAD_FOLDERS = ["products", "gallery", "pages", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

/** Map nested admin folders (pages/home, gallery/tea) → whitelist root. */
export function normalizeUploadFolder(raw?: string | null): UploadFolder {
  const root = (raw || "misc").split("/")[0]?.toLowerCase().trim() || "misc";
  if ((UPLOAD_FOLDERS as readonly string[]).includes(root)) {
    return root as UploadFolder;
  }
  return "misc";
}

export function publicUploadUrl(folder: string, filename: string) {
  return `/api/uploads/${folder}/${filename}`;
}

/** Parse `/api/uploads/{folder}/{filename}` → parts, or null. */
export function parseStoredUploadUrl(url?: string | null): {
  folder: string;
  filename: string;
} | null {
  if (!url) return null;
  const match = url.match(/^\/api\/uploads\/([^/]+)\/([^/]+)$/);
  if (!match) return null;
  const folder = match[1];
  const filename = match[2];
  if (folder.includes("..") || filename.includes("..") || filename.includes("/")) {
    return null;
  }
  return { folder, filename };
}

/** Legacy disk `/uploads/...` URLs are not available on serverless — use placeholder. */
export function resolveMediaUrl(
  url?: string | null,
  placeholder = "/images/brand/logo.png"
): string {
  if (!url) return placeholder;
  if (url.startsWith("/uploads/")) return placeholder;
  return url;
}
