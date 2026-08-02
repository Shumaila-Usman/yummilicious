"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/AdminProviders";
import { ProductForm, emptyProductForm, type ProductFormData } from "@/components/admin/ProductForm";
import type { DietaryTag } from "@/types";

function mapProductToForm(product: Record<string, unknown>): ProductFormData {
  const base = emptyProductForm();
  return {
    ...base,
    name: String(product.name ?? ""),
    shortDescription: String(product.shortDescription ?? ""),
    fullDescription: String(product.fullDescription ?? ""),
    basePrice: Number(product.basePrice ?? 0),
    categories: ((product.categories as { _id: string }[]) ?? []).map((c) =>
      typeof c === "string" ? c : c._id
    ),
    variants: (product.variants as ProductFormData["variants"]) ?? [],
    options: (product.options as ProductFormData["options"]) ?? [],
    addonIds: ((product.addonIds as { _id: string }[] | string[]) ?? []).map((a) =>
      typeof a === "string" ? a : a._id
    ),
    images: (product.images as ProductFormData["images"]) ?? [],
    featuredImage: String(product.featuredImage ?? ""),
    ingredients: (product.ingredients as string[]) ?? [],
    dietaryTags: (product.dietaryTags as DietaryTag[]) ?? [],
    includes: (product.includes as string[]) ?? [],
    isFeatured: Boolean(product.isFeatured),
    isAvailable: product.isAvailable !== false,
    isSoldOut: Boolean(product.isSoldOut),
    inventory: (product.inventory as ProductFormData["inventory"]) ?? base.inventory,
    preparationTime: product.preparationTime ? Number(product.preparationTime) : undefined,
    sale: (product.sale as ProductFormData["sale"]) ?? base.sale,
    displayOrder: Number(product.displayOrder ?? 0),
    seoTitle: String(product.seoTitle ?? ""),
    seoDescription: String(product.seoDescription ?? ""),
  };
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [initial, setInitial] = useState<ProductFormData | null>(null);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [addons, setAddons] = useState<{ _id: string; name: string; price: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminFetch<Record<string, unknown>>(`/api/products/${id}`),
      adminFetch<{ categories: { _id: string; name: string }[] }>("/api/categories?admin=true&limit=100"),
      adminFetch<{ addons: { _id: string; name: string; price: number }[] }>("/api/addons?admin=true&limit=100"),
    ]).then(([prodRes, catRes, addonRes]) => {
      if (prodRes.data) setInitial(mapProductToForm(prodRes.data));
      else toast.error(prodRes.error ?? "Product not found");
      if (catRes.data) setCategories(catRes.data.categories);
      if (addonRes.data) setAddons(addonRes.data.addons);
    }).finally(() => setPageLoading(false));
  }, [id]);

  const handleSubmit = async (data: ProductFormData) => {
    setLoading(true);
    const res = await adminFetch(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Product updated");
    router.push("/admin/products");
  };

  if (pageLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-burgundy/10" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-burgundy/5" />
        ))}
      </div>
    );
  }

  if (!initial) {
    return <p className="text-muted">Product not found</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brown">Edit Product</h1>
        <p className="text-sm text-muted">{initial.name}</p>
      </div>
      <ProductForm
        initial={initial}
        categories={categories}
        addons={addons}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        loading={loading}
      />
    </div>
  );
}
