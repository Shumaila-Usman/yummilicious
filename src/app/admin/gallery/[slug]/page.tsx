"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/AdminProviders";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";

type Img = {
  _id: string;
  title: string;
  alt: string;
  url: string;
  category: string;
  isActive: boolean;
};

export default function AdminGalleryCategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [images, setImages] = useState<Img[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () =>
    adminFetch<{ images: Img[] }>(
      `/api/gallery?admin=true&category=${encodeURIComponent(slug)}&limit=100`
    ).then((res) => {
      if (res.data?.images) setImages(res.data.images);
    });

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [slug]);

  const addImage = async () => {
    if (!title.trim() || !url.trim()) {
      toast.error("Title and image are required");
      return;
    }
    setSaving(true);
    const res = await adminFetch("/api/gallery", {
      method: "POST",
      body: JSON.stringify({
        title: title.trim(),
        alt: title.trim(),
        url,
        category: slug,
      }),
    });
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Image added");
    setTitle("");
    setUrl("");
    await load();
  };

  const remove = async (id: string) => {
    const res = await adminFetch(`/api/gallery/${id}`, { method: "DELETE" });
    if (res.error) toast.error(res.error);
    else {
      toast.success("Deleted");
      await load();
    }
  };

  const updateUrl = async (id: string, nextUrl: string) => {
    const res = await adminFetch(`/api/gallery/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ url: nextUrl }),
    });
    if (res.error) toast.error(res.error);
    else {
      toast.success("Image updated");
      await load();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/gallery"
          className="mb-2 inline-flex items-center gap-1 text-sm text-burgundy hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Gallery
        </Link>
        <h1 className="font-display text-3xl font-bold capitalize text-brown">
          {slug.replace(/-/g, " ")}
        </h1>
        <p className="text-sm text-muted">Add, replace, or delete images in this category.</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-burgundy/10 bg-cream p-5">
        <h2 className="font-display text-lg font-bold text-burgundy">Add image</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm"
        />
        <ImageUploadField
          label="Image file"
          value={url}
          folder="gallery"
          onChange={setUrl}
        />
        <Button onClick={addImage} loading={saving} className="gap-2">
          <Plus className="h-4 w-4" />
          Add to gallery
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-burgundy/5" />
          ))}
        {!loading && images.length === 0 && (
          <p className="text-sm text-muted">No images in this category yet.</p>
        )}
        {images.map((img) => (
          <div
            key={img._id}
            className="overflow-hidden rounded-2xl border border-burgundy/10 bg-cream"
          >
            <div className="relative aspect-[4/3] bg-white">
              <Image
                src={img.url.startsWith("/uploads/") ? "/images/hero/hero-bg.png" : img.url}
                alt={img.alt}
                fill
                className="object-cover"
                unoptimized={img.url.startsWith("/api/uploads/")}
              />
            </div>
            <div className="space-y-2 p-3">
              <p className="font-medium text-brown">{img.title}</p>
              <ImageUploadField
                label="Replace"
                value={img.url}
                folder="gallery"
                onChange={(next) => updateUrl(img._id, next)}
              />
              <Button
                type="button"
                variant="ghost"
                className="gap-2 text-burgundy"
                onClick={() => remove(img._id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
