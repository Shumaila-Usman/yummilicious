"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { applySale } from "@/lib/pricing/calculate";
import { formatPKR } from "@/lib/utils/format";
import { getProductImage, type StoreProduct } from "@/lib/data/fallback";
import { useFavorites } from "@/hooks/useFavorites";
import { useStoreStatus } from "@/hooks/useStoreStatus";
import { cn } from "@/lib/utils/cn";

interface ProductCardProps {
  product: StoreProduct;
  onQuickView?: (product: StoreProduct) => void;
  className?: string;
  index?: number;
}

export function ProductCard({
  product,
  onQuickView,
  className,
  index = 0,
}: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { open: storeOpen } = useStoreStatus();
  const image = getProductImage(product);
  const defaultVariant =
    product.variants?.find((v) => v.isDefault) || product.variants?.[0];
  const basePrice = defaultVariant?.price ?? product.basePrice;
  const pricing = applySale(basePrice, product.sale);
  const fav = isFavorite(product._id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-burgundy/10 bg-white/70 shadow-warm backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-gold",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream/80">
        <Link href={`/menu/${product.slug}`}>
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-contain p-2 transition duration-700 group-hover:scale-[1.03]"
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
          />
        </Link>

        {pricing.onSale && product.sale.showBadge !== false && (
          <span className="absolute left-3 top-3 rounded-full bg-orange px-3 py-1 text-xs font-bold text-cream shadow-gold">
            {pricing.percentOff}% OFF
          </span>
        )}

        {product.isSoldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-brown/60 text-lg font-bold text-cream">
            Sold Out
          </span>
        )}

        <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-100 transition sm:right-3 sm:top-3 sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => toggleFavorite(product._id)}
            className={cn(
              "focus-ring rounded-full bg-cream/90 p-2 shadow-warm backdrop-blur-sm transition",
              fav ? "text-burgundy" : "text-brown/60 hover:text-burgundy"
            )}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-4 w-4", fav && "fill-burgundy")} />
          </button>
          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="focus-ring rounded-full bg-cream/90 p-2 text-brown/60 shadow-warm backdrop-blur-sm hover:text-burgundy"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        {product.categories?.[0] && (
          <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-orange">
            {product.categories[0].name}
          </span>
        )}
        <Link href={`/menu/${product.slug}`}>
          <h3 className="font-display text-base font-bold text-brown transition hover:text-burgundy sm:text-lg">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">
          {product.shortDescription}
        </p>

        <div className="mt-4 flex flex-col gap-3 min-[400px]:flex-row min-[400px]:items-end min-[400px]:justify-between min-[400px]:gap-2">
          <div className="min-w-0">
            {product.variants && product.variants.length > 1 ? (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  From
                </p>
                <span className="font-display text-xl font-bold text-burgundy">
                  {formatPKR(pricing.finalPrice)}
                </span>
                <p className="mt-1 hidden text-[11px] leading-snug text-muted sm:line-clamp-2 sm:block">
                  {product.variants
                    .map((v) => `${v.name} · ${formatPKR(v.price)}`)
                    .join("  ·  ")}
                </p>
              </>
            ) : (
              <>
                <span className="font-display text-xl font-bold text-burgundy">
                  {formatPKR(pricing.finalPrice)}
                </span>
                {pricing.onSale && (
                  <span className="ml-2 text-sm text-muted line-through">
                    {formatPKR(pricing.originalPrice)}
                  </span>
                )}
              </>
            )}
          </div>
          <Link href={`/menu/${product.slug}`} className="block w-full min-[400px]:w-auto">
            <Button
              size="sm"
              variant="secondary"
              disabled={!storeOpen || product.isSoldOut || !product.isAvailable}
              className="w-full gap-1.5 min-[400px]:w-auto"
            >
              <ShoppingBag className="h-4 w-4" />
              Add
            </Button>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
