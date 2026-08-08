/**
 * @deprecated Disk uploads are not used on serverless.
 * Use `@/lib/uploads/stored` (MongoDB StoredUpload) instead.
 */
export {
  saveStoredUpload as saveLocalUpload,
  resolveMediaUrl,
  deleteStoredUploadByUrl,
  normalizeUploadFolder,
  UPLOAD_FOLDERS,
} from "@/lib/uploads/stored";

export { resolveMediaUrl as resolveMediaUrlClient } from "@/lib/uploads/types";
