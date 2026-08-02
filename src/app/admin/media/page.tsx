"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/AdminProviders";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/Button";

interface MediaAsset {
  _id: string;
  url: string;
  filename: string;
  format: string;
  width?: number;
  height?: number;
  bytes?: number;
  folder: string;
  alt?: string;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    adminFetch<{ assets: MediaAsset[] }>("/api/media?limit=50")
      .then((res) => {
        if (res.data) setAssets(res.data.assets);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "yummilicious");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Upload failed");
        return;
      }
      toast.success("File uploaded");
      load();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await adminFetch(`/api/media?id=${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Media deleted");
    setDeleteId(null);
    load();
  };

  const copyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset._id);
    toast.success("URL copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brown">Media Library</h1>
          <p className="text-sm text-muted">Upload and manage images</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} loading={uploading}>
            <Upload className="h-4 w-4" /> Upload Image
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-burgundy/5" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-burgundy/30 py-16 text-center">
          <p className="text-muted">No media uploaded yet</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => fileRef.current?.click()}>
            Upload your first image
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset) => (
            <div key={asset._id} className="group rounded-xl border border-burgundy/15 bg-white/60 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url}
                alt={asset.alt ?? asset.filename}
                className="aspect-square w-full object-cover"
              />
              <div className="p-3">
                <p className="truncate text-sm font-medium text-brown">{asset.filename}</p>
                <p className="text-xs text-muted">
                  {asset.format?.toUpperCase()} · {formatBytes(asset.bytes)}
                  {asset.width && asset.height && ` · ${asset.width}×${asset.height}`}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => copyUrl(asset)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-burgundy hover:bg-burgundy/10"
                  >
                    {copiedId === asset._id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    Copy URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(asset._id)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-burgundy hover:bg-burgundy/10"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Media"
        message="This will permanently delete the file from storage."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
