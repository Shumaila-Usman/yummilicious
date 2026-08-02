"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/AdminProviders";
import { ProductForm, emptyProductForm, type ProductFormData } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [addons, setAddons] = useState<{ _id: string; name: string; price: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      adminFetch<{ categories: { _id: string; name: string }[] }>("/api/categories?admin=true&limit=100"),
      adminFetch<{ addons: { _id: string; name: string; price: number }[] }>("/api/addons?admin=true&limit=100"),
    ]).then(([catRes, addonRes]) => {
      if (catRes.data) setCategories(catRes.data.categories);
      if (addonRes.data) setAddons(addonRes.data.addons);
    });
  }, []);

  const handleSubmit = async (data: ProductFormData) => {
    if (data.categories.length === 0) {
      toast.error("Select at least one category");
      return;
    }
    setLoading(true);
    const res = await adminFetch("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Product created");
    router.push("/admin/products");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brown">New Product</h1>
        <p className="text-sm text-muted">Add a new item to your menu</p>
      </div>
      <ProductForm
        initial={emptyProductForm()}
        categories={categories}
        addons={addons}
        onSubmit={handleSubmit}
        submitLabel="Create Product"
        loading={loading}
      />
    </div>
  );
}
