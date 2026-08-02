"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/AdminProviders";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/Button";
import { formatPKR } from "@/lib/utils/format";

interface Product {
  _id: string;
  name: string;
  slug: string;
  basePrice: number;
  isAvailable: boolean;
  isSoldOut: boolean;
  isFeatured: boolean;
  isDeleted: boolean;
  featuredImage?: string;
  categories: { name: string }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ admin: "true", limit: "100", includeDeleted: "true" });
    if (search) params.set("search", search);
    adminFetch<{ products: Product[] }>(`/api/products?${params}`)
      .then((res) => {
        if (res.data) setProducts(res.data.products);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await adminFetch(`/api/products/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Product deleted");
    setDeleteId(null);
    load();
  };

  const handleRestore = async (id: string) => {
    const res = await adminFetch(`/api/products/${id}?restore=true`, {
      method: "PATCH",
      body: JSON.stringify({}),
    });
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Product restored");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brown">Products</h1>
          <p className="text-sm text-muted">Manage your menu items</p>
        </div>
        <Link href="/admin/products/new">
          <Button variant="secondary" size="sm">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-lg border border-burgundy/20 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-burgundy/5" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-burgundy/30 bg-white/40 py-16 text-center">
          <p className="text-muted">No products found</p>
          <Link href="/admin/products/new" className="mt-4 inline-block">
            <Button variant="outline" size="sm">Create your first product</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-burgundy/15 bg-white/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-burgundy/10 bg-burgundy/5 text-left text-muted">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Categories</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product._id}
                  className={`border-b border-burgundy/5 ${product.isDeleted ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.featuredImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.featuredImage}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-brown">{product.name}</p>
                        {product.isFeatured && (
                          <span className="text-xs text-orange">Featured</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {product.categories?.map((c) => c.name).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatPKR(product.basePrice)}</td>
                  <td className="px-4 py-3">
                    {product.isDeleted ? (
                      <span className="rounded-full bg-brown/10 px-2 py-0.5 text-xs text-brown">Deleted</span>
                    ) : product.isSoldOut ? (
                      <span className="rounded-full bg-burgundy/10 px-2 py-0.5 text-xs text-burgundy">Sold Out</span>
                    ) : product.isAvailable ? (
                      <span className="rounded-full bg-green/10 px-2 py-0.5 text-xs text-green">Available</span>
                    ) : (
                      <span className="rounded-full bg-orange/10 px-2 py-0.5 text-xs text-orange">Hidden</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {product.isDeleted ? (
                        <button
                          type="button"
                          onClick={() => handleRestore(product._id)}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-green hover:bg-green/10"
                        >
                          Restore
                        </button>
                      ) : (
                        <>
                          <Link
                            href={`/admin/products/${product._id}/edit`}
                            className="rounded-lg p-2 text-burgundy hover:bg-burgundy/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteId(product._id)}
                            className="rounded-lg p-2 text-burgundy hover:bg-burgundy/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Product"
        message="This will soft-delete the product. You can restore it later."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
