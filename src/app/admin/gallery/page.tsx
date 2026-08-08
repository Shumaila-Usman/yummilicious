"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/AdminProviders";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

type Cat = {
  _id: string;
  name: string;
  slug: string;
  imageCount?: number;
};

export default function AdminGalleryPage() {
  const [categories, setCategories] = useState<Cat[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () =>
    adminFetch<{ categories: Cat[] }>("/api/gallery/categories?admin=true").then((res) => {
      if (res.data?.categories) setCategories(res.data.categories);
    });

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const addCategory = async () => {
    if (!name.trim()) return;
    const res = await adminFetch("/api/gallery/categories", {
      method: "POST",
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Category added");
    setName("");
    await load();
  };

  const removeCategory = async () => {
    if (!deleteId) return;
    const res = await adminFetch(`/api/gallery/categories/${deleteId}`, {
      method: "DELETE",
    });
    if (res.error) toast.error(res.error);
    else {
      toast.success("Category deleted");
      setDeleteId(null);
      await load();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brown">Gallery</h1>
        <p className="text-sm text-muted">
          Manage categories, then open one to add or edit images.
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-burgundy/10 bg-cream p-4 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm"
        />
        <Button type="button" onClick={addCategory} className="gap-2">
          <Plus className="h-4 w-4" />
          Add category
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-burgundy/5" />
          ))}
        {!loading &&
          categories.map((cat) => (
            <div
              key={cat._id}
              className="flex items-center gap-3 rounded-2xl border border-burgundy/10 bg-cream p-4"
            >
              <Link href={`/admin/gallery/${cat.slug}`} className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold text-brown">{cat.name}</p>
                <p className="text-xs text-muted">
                  {cat.imageCount ?? 0} images · {cat.slug}
                </p>
              </Link>
              <Link
                href={`/admin/gallery/${cat.slug}`}
                className="rounded-lg p-2 text-burgundy hover:bg-burgundy/10"
              >
                <ChevronRight className="h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={() => setDeleteId(cat._id)}
                className="rounded-lg p-2 text-burgundy/70 hover:bg-burgundy/10"
                aria-label="Delete category"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
      </div>

      <ConfirmModal
        open={!!deleteId}
        title="Delete category?"
        message="All images in this category will be removed too."
        confirmLabel="Delete"
        onConfirm={removeCategory}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
