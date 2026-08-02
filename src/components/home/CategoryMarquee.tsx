import Link from "next/link";
import Image from "next/image";
import type { StoreCategory } from "@/lib/data/fallback";
import { FALLBACK_CATEGORIES } from "@/lib/data/fallback";

interface CategoryMarqueeProps {
  categories?: StoreCategory[];
}

export function CategoryMarquee({ categories = FALLBACK_CATEGORIES }: CategoryMarqueeProps) {
  const items = [...categories, ...categories];

  return (
    <section className="overflow-hidden border-y border-burgundy/10 bg-burgundy py-5">
      <div className="animate-marquee flex w-max gap-8 whitespace-nowrap">
        {items.map((cat, i) => (
          <Link
            key={`${cat.slug}-${i}`}
            href={`/categories/${cat.slug}`}
            className="group flex items-center gap-3 px-4 transition hover:opacity-80"
          >
            <span className="text-2xl" aria-hidden>
              {cat.icon ?? "🍽️"}
            </span>
            <span className="font-display text-lg font-bold text-cream group-hover:text-gold">
              {cat.name}
            </span>
            {cat.image && (
              <span className="relative hidden h-10 w-10 overflow-hidden rounded-full sm:inline-block">
                <Image src={cat.image} alt="" fill className="object-cover" sizes="40px" />
              </span>
            )}
            <span className="text-gold/50" aria-hidden>
              ✦
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
