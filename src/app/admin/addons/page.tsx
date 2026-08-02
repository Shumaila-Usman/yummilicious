"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/AdminProviders";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/Button";
import { formatPKR } from "@/lib/utils/format";

interface Addon {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  size?: string;
  isActive: boolean;
  displayOrder: number;
}

const emptyForm = {
  name: "",
  description: "",
  price: 0,
  size: "",
  isActive: true,
  displayOrder: 0,
};

export default function AdminAddonsPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminFetch<{ addons: Addon[] }>("/api/addons?admin=true&limit=100")
      .then((res) => {
        if (res.data) setAddons(res.data.addons);
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
    const res = await adminFetch("/api/addons", {
      method: "POST",
      body: JSON.stringify(newForm),
    });
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Add-on created");
    setNewForm(emptyForm);
    setAdding(false);
    load();
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    const res = await adminFetch(`/api/addons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(editForm),
    });
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Add-on updated");
    setEditId(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    const res = await adminFetch(`/api/addons/${deleteId}`, { method: "DELETE" });
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Add-on deleted");
    setDeleteId(null);
    load();
  };

  const inputClass =
    "w-full rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brown">Add-ons</h1>
          <p className="text-sm text-muted">Extra items customers can add to orders</p>
        </div>
        {!adding && (
          <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add Add-on
          </Button>
        )}
      </div>

      {adding && (
        <div className="rounded-xl border border-burgundy/15 bg-white/60 p-5">
          <h3 className="font-display mb-4 text-lg font-semibold text-brown">New Add-on</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <input className={inputClass} placeholder="Name" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} />
            <input className={inputClass} type="number" placeholder="Price" value={newForm.price} onChange={(e) => setNewForm({ ...newForm, price: Number(e.target.value) })} />
            <input className={inputClass} placeholder="Size" value={newForm.size} onChange={(e) => setNewForm({ ...newForm, size: e.target.value })} />
            <input className={inputClass} type="number" placeholder="Order" value={newForm.displayOrder} onChange={(e) => setNewForm({ ...newForm, displayOrder: Number(e.target.value) })} />
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleCreate} loading={saving}>Save</Button>
            <Button variant="outline" size="sm" onClick={() => { setAdding(false); setNewForm(emptyForm); }}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-burgundy/5" />
          ))}
        </div>
      ) : addons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-burgundy/30 py-16 text-center text-muted">
          No add-ons yet
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-burgundy/15 bg-white/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-burgundy/10 bg-burgundy/5 text-left text-muted">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {addons.map((addon) => (
                <tr key={addon._id} className="border-b border-burgundy/5">
                  {editId === addon._id ? (
                    <>
                      <td className="px-4 py-2">
                        <input className={inputClass} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                      </td>
                      <td className="px-4 py-2">
                        <input className={inputClass} type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })} />
                      </td>
                      <td className="px-4 py-2">
                        <input className={inputClass} value={editForm.size} onChange={(e) => setEditForm({ ...editForm, size: e.target.value })} />
                      </td>
                      <td className="px-4 py-2">
                        <label className="flex items-center gap-1 text-xs">
                          <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} />
                          Active
                        </label>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => handleUpdate(addon._id)} className="p-2 text-green"><Check className="h-4 w-4" /></button>
                          <button type="button" onClick={() => setEditId(null)} className="p-2 text-muted"><X className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-brown">{addon.name}</td>
                      <td className="px-4 py-3">{formatPKR(addon.price)}</td>
                      <td className="px-4 py-3 text-muted">{addon.size || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${addon.isActive ? "bg-green/10 text-green" : "bg-brown/10 text-brown"}`}>
                          {addon.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => { setEditId(addon._id); setEditForm({ name: addon.name, description: addon.description ?? "", price: addon.price, size: addon.size ?? "", isActive: addon.isActive, displayOrder: addon.displayOrder }); }} className="p-2 text-burgundy hover:bg-burgundy/10 rounded-lg">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => setDeleteId(addon._id)} className="p-2 text-burgundy hover:bg-burgundy/10 rounded-lg">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Add-on"
        message="This will permanently delete this add-on."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={saving}
      />
    </div>
  );
}
