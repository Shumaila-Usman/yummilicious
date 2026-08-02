import Link from "next/link";
import Image from "next/image";
import { Tag } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { fetchProducts } from "@/lib/data/server";
import { applySale, isSaleActive } from "@/lib/pricing/calculate";
import { formatPKR } from "@/lib/utils/format";
import { getProductImage } from "@/lib/data/fallback";

export const metadata = {
  title: "Deals & Combos",
  description: "Save on breakfast combos and special offers at Yummilicious.",
};

export default async function DealsPage() {
  const products = await fetchProducts();
  const deals = products.filter((p) => isSaleActive(p.sale) || p.name.toLowerCase().includes("deal"));

  return (
    <div className="bg-surface py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <ScrollReveal className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange/15 px-4 py-1.5 text-sm font-semibold text-burgundy">
            <Tag className="h-4 w-4" />
            Special Offers
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold text-burgundy sm:text-4xl">
            Deals & Combos
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Grab these limited-time offers during our ordering windows.
          </p>
        </ScrollReveal>

        {deals.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display text-xl text-brown">No active deals right now</p>
            <p className="mt-2 text-muted">Check back soon or browse our full menu.</p>
            <Link href="/menu" className="mt-6 inline-block">
              <Button>Browse Menu</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {deals.map((product, i) => {
              const pricing = applySale(
                product.variants?.[0]?.price ?? product.basePrice,
                product.sale
              );
              return (
                <ScrollReveal key={product._id} delay={i * 0.08}>
                  <div className="overflow-hidden rounded-3xl border border-burgundy/10 bg-white shadow-warm">
                    <div className="relative aspect-video">
                      <Image
                        src={getProductImage(product)}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="33vw"
                      />
                      {pricing.onSale && (
                        <span className="absolute left-3 top-3 rounded-full bg-orange px-3 py-1 text-xs font-bold text-cream">
                          Save {pricing.percentOff}%
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <h2 className="font-display text-xl font-bold text-burgundy">{product.name}</h2>
                      <p className="mt-2 text-sm text-muted">{product.shortDescription}</p>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="font-display text-2xl font-bold text-orange">
                          {formatPKR(pricing.finalPrice)}
                        </span>
                        {pricing.onSale && (
                          <span className="text-sm text-muted line-through">
                            {formatPKR(pricing.originalPrice)}
                          </span>
                        )}
                      </div>
                      <Link href={`/menu/${product.slug}`} className="mt-4 block">
                        <Button className="w-full">Order This Deal</Button>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
