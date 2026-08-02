"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { PageTransition } from "@/components/animations/PageTransition";
import type { StoreProduct, StoreCategory, StoreAddon } from "@/lib/data/fallback";
import { FALLBACK_ADDONS, resolveAddonsForProduct } from "@/lib/data/fallback";

interface MenuClientProps {
  products: StoreProduct[];
  categories: StoreCategory[];
  addons?: StoreAddon[];
}

export function MenuClient({
  products,
  categories,
  addons = FALLBACK_ADDONS,
}: MenuClientProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialCategory = searchParams.get("category") ?? "all";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [quickView, setQuickView] = useState<StoreProduct | null>(null);

  const filtered = useMemo(() => {
    let result = products;
    if (category !== "all") {
      result = result.filter((p) =>
        p.categories?.some((c) => c.slug === category || c._id === category)
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.categories?.some((c) => c.name.toLowerCase().includes(q))
      );
    }
    return result;
  }, [products, category, query]);

  return (
    <PageTransition>
      <div className="bg-surface py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-10 text-center">
            <span className="font-script text-xl text-orange">Our Menu</span>
            <h1 className="font-display mt-2 text-2xl font-bold text-burgundy sm:text-4xl">
              Full Menu
            </h1>
            <p className="mx-auto mt-3 max-w-xl px-1 text-sm text-muted sm:text-base">
              Browse our homemade favourites — fresh breakfasts, shawarmas, rolls & more.
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes…"
                className="focus-ring w-full rounded-full border border-burgundy/15 bg-white py-3 pl-10 pr-4"
                aria-label="Search menu"
              />
            </div>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              <button
                type="button"
                onClick={() => setCategory("all")}
                className={`focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === "all"
                    ? "bg-burgundy text-cream"
                    : "bg-white text-brown hover:bg-burgundy/10"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setCategory(cat.slug)}
                  className={`focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                    category === cat.slug
                      ? "bg-burgundy text-cream"
                      : "bg-white text-brown hover:bg-burgundy/10"
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-display text-xl text-brown">No dishes found</p>
              <p className="mt-2 text-muted">Try a different search or category.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product, i) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={i}
                  onQuickView={setQuickView}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <QuickViewModal
        product={quickView}
        open={!!quickView}
        onClose={() => setQuickView(null)}
        addons={
          quickView ? resolveAddonsForProduct(quickView, addons) : undefined
        }
      />
    </PageTransition>
  );
}
