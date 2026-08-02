import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { fetchCategoryBySlug, fetchProducts } from "@/lib/data/server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: category.name,
    description: category.description ?? `Browse ${category.name} at Yummilicious`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) notFound();

  const allProducts = await fetchProducts();
  const products = allProducts.filter((p) =>
    p.categories?.some((c) => c.slug === slug)
  );

  return (
    <div className="bg-surface py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <ScrollReveal className="mb-10 text-center">
          <span className="text-3xl">{category.icon ?? "🍽️"}</span>
          <h1 className="font-display mt-2 text-4xl font-bold text-burgundy">{category.name}</h1>
          {category.description && (
            <p className="mx-auto mt-3 max-w-xl text-muted">{category.description}</p>
          )}
        </ScrollReveal>

        {products.length === 0 ? (
          <p className="py-16 text-center text-muted">No items in this category yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
