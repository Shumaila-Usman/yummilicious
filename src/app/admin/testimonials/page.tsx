"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/AdminProviders";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

type Item = {
  _id: string;
  name: string;
  quote: string;
  role?: string;
  photo?: string;
  rating: number;
  isActive: boolean;
};

const empty = (): Omit<Item, "_id"> => ({
  name: "",
  quote: "",
  role: "",
  photo: "",
  rating: 5,
  isActive: true,
});

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState(empty());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () =>
    adminFetch<{ testimonials: Item[] }>("/api/testimonials?admin=true&limit=100").then(
      (res) => {
        if (res.data?.testimonials) setItems(res.data.testimonials);
      }
    );

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!form.name.trim() || !form.quote.trim()) {
      toast.error("Name and quote are required");
      return;
    }
    if (editingId) {
      const res = await adminFetch(`/api/testimonials/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      if (res.error) return toast.error(res.error);
      toast.success("Updated");
    } else {
      const res = await adminFetch("/api/testimonials", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (res.error) return toast.error(res.error);
      toast.success("Added");
    }
    setForm(empty());
    setEditingId(null);
    await load();
  };

  const remove = async () => {
    if (!deleteId) return;
    const res = await adminFetch(`/api/testimonials/${deleteId}`, { method: "DELETE" });
    if (res.error) toast.error(res.error);
    else {
      toast.success("Deleted");
      setDeleteId(null);
      await load();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brown">Testimonials</h1>
        <p className="text-sm text-muted">
          These appear on the Testimonials page slider. Hero copy is under Pages → Testimonials.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-burgundy/10 bg-cream p-5">
        <h2 className="font-display text-lg font-bold text-burgundy">
          {editingId ? "Edit testimonial" : "Add testimonial"}
        </h2>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Person name"
          className="w-full rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm"
        />
        <input
          value={form.role || ""}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          placeholder="Role / area (optional)"
          className="w-full rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm"
        />
        <textarea
          value={form.quote}
          onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
          placeholder="Quote"
          rows={3}
          className="w-full rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm"
        />
        <ImageUploadField
          label="Photo (optional)"
          value={form.photo || ""}
          folder="misc"
          onChange={(photo) => setForm((f) => ({ ...f, photo }))}
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={save} className="gap-2">
            <Plus className="h-4 w-4" />
            {editingId ? "Save changes" : "Add"}
          </Button>
          {editingId && (
            <Button
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setForm(empty());
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {loading && <div className="h-24 animate-pulse rounded-2xl bg-burgundy/5" />}
        {items.map((item) => (
          <div
            key={item._id}
            className="flex flex-col gap-3 rounded-2xl border border-burgundy/10 bg-cream p-4 sm:flex-row sm:items-start"
          >
            <div className="min-w-0 flex-1">
              <p className="font-bold text-brown">{item.name}</p>
              {item.role && <p className="text-xs text-muted">{item.role}</p>}
              <p className="mt-2 text-sm text-brown/80">&ldquo;{item.quote}&rdquo;</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(item._id);
                  setForm({
                    name: item.name,
                    quote: item.quote,
                    role: item.role,
                    photo: item.photo,
                    rating: item.rating,
                    isActive: item.isActive,
                  });
                }}
              >
                Edit
              </Button>
              <Button variant="ghost" className="text-burgundy" onClick={() => setDeleteId(item._id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={!!deleteId}
        title="Delete testimonial?"
        message="This cannot be undone."
        onConfirm={remove}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
