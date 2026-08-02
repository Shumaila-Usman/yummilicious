"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/AdminProviders";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/Button";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

const emptyForm = { name: "", description: "", displayOrder: 0, isActive: true };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminFetch<{ categories: Category[] }>("/api/categories?admin=true&limit=100")
      .then((res) => {
        if (res.data) setCategories(res.data.categories);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!newForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    const res = await adminFetch("/api/categories", {
      method: "POST",
      body: JSON.stringify(newForm),
    });
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Category created");
    setNewForm(emptyForm);
    setAdding(false);
    load();
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    const res = await adminFetch(`/api/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(editForm),
    });
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Category updated");
    setEditId(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    const res = await adminFetch(`/api/categories/${deleteId}`, { method: "DELETE" });
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Category deleted");
    setDeleteId(null);
    load();
  };

  const startEdit = (cat: Category) => {
    setEditId(cat._id);
    setEditForm({
      name: cat.name,
      description: cat.description ?? "",
      displayOrder: cat.displayOrder,
      isActive: cat.isActive,
    });
  };

  const inputClass =
    "w-full rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brown">Categories</h1>
          <p className="text-sm text-muted">Organize your menu</p>
        </div>
        {!adding && (
          <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        )}
      </div>

      {adding && (
        <div className="rounded-xl border border-burgundy/15 bg-white/60 p-5">
          <h3 className="font-display mb-4 text-lg font-semibold text-brown">New Category</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className={inputClass}
              placeholder="Name"
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Display order"
              value={newForm.displayOrder}
              onChange={(e) => setNewForm({ ...newForm, displayOrder: Number(e.target.value) })}
            />
            <input
              className={`${inputClass} sm:col-span-2`}
              placeholder="Description"
              value={newForm.description}
              onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleCreate} loading={saving}>
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setAdding(false); setNewForm(emptyForm); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-burgundy/5" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-burgundy/30 py-16 text-center text-muted">
          No categories yet
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-burgundy/15 bg-white/60 px-4 py-3"
            >
              {editId === cat._id ? (
                <>
                  <input
                    className={`${inputClass} flex-1 min-w-[140px]`}
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                  <input
                    className={`${inputClass} w-24`}
                    type="number"
                    value={editForm.displayOrder}
                    onChange={(e) => setEditForm({ ...editForm, displayOrder: Number(e.target.value) })}
                  />
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                  <button type="button" onClick={() => handleUpdate(cat._id)} className="p-2 text-green">
                    <Check className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setEditId(null)} className="p-2 text-muted">
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-[140px]">
                    <p className="font-medium text-brown">{cat.name}</p>
                    <p className="text-xs text-muted">{cat.slug}</p>
                  </div>
                  <span className="text-sm text-muted">Order: {cat.displayOrder}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      cat.isActive ? "bg-green/10 text-green" : "bg-brown/10 text-brown"
                    }`}
                  >
                    {cat.isActive ? "Active" : "Inactive"}
                  </span>
                  <button type="button" onClick={() => startEdit(cat)} className="p-2 text-burgundy hover:bg-burgundy/10 rounded-lg">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setDeleteId(cat._id)} className="p-2 text-burgundy hover:bg-burgundy/10 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Category"
        message="This will permanently delete the category. Products may lose this category."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={saving}
      />
    </div>
  );
}
