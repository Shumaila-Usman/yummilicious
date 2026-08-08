"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { resolveMediaUrl, type UploadFolder } from "@/lib/uploads/types";

type Props = {
  label?: string;
  value: string;
  /** Whitelist root: products | gallery | pages | misc (nested paths normalize to root) */
  folder?: UploadFolder | string;
  onChange: (url: string) => void;
  className?: string;
};

async function deleteMongoUpload(url: string) {
  if (!url.startsWith("/api/uploads/")) return;
  await fetch(`/api/upload?url=${encodeURIComponent(url)}`, {
    method: "DELETE",
    credentials: "include",
  }).catch(() => null);
}

export function ImageUploadField({
  label = "Image",
  value,
  folder = "misc",
  onChange,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const preview = value ? resolveMediaUrl(value, value) : "";

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      if (value.startsWith("/api/uploads/")) {
        fd.append("replaceUrl", value);
      }
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url as string);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    const prev = value;
    onChange("");
    if (prev.startsWith("/api/uploads/")) {
      await deleteMongoUpload(prev);
      toast.success("Image removed");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-brown">{label}</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative h-36 w-full overflow-hidden rounded-xl border border-burgundy/15 bg-white sm:w-56">
          {preview && !preview.startsWith("/uploads/") ? (
            <Image
              src={preview}
              alt=""
              fill
              className="object-cover"
              sizes="224px"
              unoptimized={preview.startsWith("/api/uploads/")}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {value ? "Replace image" : "Upload image"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="outline"
              className="gap-2 text-burgundy"
              onClick={() => void remove()}
              disabled={uploading}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          )}
          <p className="text-[11px] text-muted break-all">
            {value || "No URL yet — upload to MongoDB (works on Vercel)"}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Alias matching the LocalImageField naming from the CMS prompt */
export const LocalImageField = ImageUploadField;
