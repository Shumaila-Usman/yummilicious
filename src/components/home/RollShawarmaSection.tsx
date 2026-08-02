import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Button } from "@/components/ui/Button";
import type { StoreProduct } from "@/lib/data/fallback";
import { getProductImage } from "@/lib/data/fallback";

interface RollShawarmaSectionProps {
  products: StoreProduct[];
}

export function RollShawarmaSection({ products }: RollShawarmaSectionProps) {
  const rolls = products.filter((p) =>
    p.categories?.some((c) => c.slug.includes("roll") || c.slug.includes("shawarma"))
  );
  const display = rolls.slice(0, 3);
  const fallback = products.slice(0, 3);
  const items = display.length >= 2 ? display : fallback;

  return (
    <section className="paper-texture py-14 sm:py-20 lg:py-28">
      <div className="relative z-[2] mx-auto max-w-7xl px-4 lg:px-6">
        <ScrollReveal className="mb-12 text-center">
          <span className="font-script text-xl text-orange">Evening Favourites</span>
          <h2 className="font-display mt-2 text-3xl font-bold text-burgundy sm:text-4xl">
            Rolls & Shawarma
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Juicy wraps and flaky paratha rolls — perfect for the 8 PM ordering window.
          </p>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((product, i) => (
            <ScrollReveal key={product._id} delay={i * 0.1}>
              <Link
                href={`/menu/${product.slug}`}
                className="group relative block overflow-hidden rounded-3xl shadow-warm"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={getProductImage(product)}
                    alt={product.name}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brown via-brown/20 to-transparent" />
                  <div className="absolute bottom-0 p-6">
                    <h3 className="font-display text-xl font-bold text-cream">{product.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-cream/80">
                      {product.shortDescription}
                    </p>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-10 text-center" delay={0.3}>
          <Link href="/menu">
            <Button variant="secondary">See All Rolls & Shawarma</Button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
