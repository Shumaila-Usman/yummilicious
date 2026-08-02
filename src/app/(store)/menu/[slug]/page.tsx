import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AddToCartPanel } from "@/components/product/AddToCartPanel";
import { ProductCard } from "@/components/product/ProductCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { applySale, getEffectiveVariantPrice } from "@/lib/pricing/calculate";
import { fetchProductBySlug, fetchProducts, fetchActiveAddons } from "@/lib/data/server";
import { getProductImage, resolveAddonsForProduct } from "@/lib/data/fallback";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const [allProducts, addonCatalog] = await Promise.all([fetchProducts(), fetchActiveAddons()]);
  const related = allProducts
    .filter(
      (p) =>
        p._id !== product._id &&
        p.categories?.some((c) => product.categories?.some((pc) => pc.slug === c.slug))
    )
    .slice(0, 4);
  const addons = resolveAddonsForProduct(product, addonCatalog);

  const image = getProductImage(product);
  const defaultVariant = product.variants?.find((v) => v.isDefault) || product.variants?.[0];
  const pricing = defaultVariant
    ? getEffectiveVariantPrice(defaultVariant, product.sale)
    : applySale(product.basePrice, product.sale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image,
    offers: {
      "@type": "Offer",
      price: pricing.finalPrice,
      priceCurrency: "PKR",
      availability: product.isAvailable && !product.isSoldOut
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-surface py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <Link
            href="/menu"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-burgundy hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Link>

          <div className="grid gap-10 lg:grid-cols-2">
            <ScrollReveal>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-cream shadow-warm sm:aspect-square">
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  className="object-contain p-3 sm:p-4"
                  priority
                  sizes="(max-width:1024px) 100vw, 50vw"
                />
                {pricing.onSale && (
                  <span className="absolute left-4 top-4 rounded-full bg-orange px-4 py-1.5 text-sm font-bold text-cream">
                    {pricing.percentOff}% OFF
                  </span>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.1}>
              {product.categories?.[0] && (
                <span className="text-xs font-semibold uppercase tracking-wider text-orange">
                  {product.categories[0].name}
                </span>
              )}
              <h1 className="font-display mt-1 text-2xl font-bold text-burgundy sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-3 text-muted leading-relaxed">{product.fullDescription}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {product.dietaryTags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-burgundy/10 px-3 py-1 text-xs font-medium capitalize text-burgundy"
                  >
                    {tag.replace(/-/g, " ")}
                  </span>
                ))}
              </div>

              {product.ingredients?.length > 0 && (
                <div className="mt-6">
                  <h2 className="font-display text-sm font-bold text-brown">Ingredients</h2>
                  <p className="mt-1 text-sm text-muted">{product.ingredients.join(", ")}</p>
                </div>
              )}

              <div className="mt-8 rounded-3xl border border-burgundy/10 bg-cream p-4 sm:p-6">
                <AddToCartPanel product={product} addons={addons} />
              </div>
            </ScrollReveal>
          </div>

          {related.length > 0 && (
            <section className="mt-20">
              <h2 className="font-display mb-8 text-2xl font-bold text-burgundy">You May Also Like</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
