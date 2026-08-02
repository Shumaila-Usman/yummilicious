"use client";

import Image from "next/image";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { AddToCartPanel } from "@/components/product/AddToCartPanel";
import { applySale } from "@/lib/pricing/calculate";
import { formatPKR } from "@/lib/utils/format";
import {
  FALLBACK_ADDONS,
  getProductImage,
  resolveAddonsForProduct,
  type StoreAddon,
  type StoreProduct,
} from "@/lib/data/fallback";

interface QuickViewModalProps {
  product: StoreProduct | null;
  open: boolean;
  onClose: () => void;
  addons?: StoreAddon[];
}

export function QuickViewModal({
  product,
  open,
  onClose,
  addons = FALLBACK_ADDONS,
}: QuickViewModalProps) {
  if (!product) return null;

  const image = getProductImage(product);
  const productAddons = resolveAddonsForProduct(product, addons);
  const defaultVariant =
    product.variants?.find((v) => v.isDefault) || product.variants?.[0];
  const basePrice = defaultVariant?.price ?? product.basePrice;
  const pricing = applySale(basePrice, product.sale);

  return (
    <Modal open={open} onClose={onClose} size="xl" className="overflow-hidden">
      <div className="grid gap-5 p-4 sm:gap-6 sm:p-6 md:grid-cols-2">
        <div className="relative mx-auto aspect-[4/3] w-full max-h-[30vh] overflow-hidden rounded-2xl bg-cream/80 md:mx-0 md:aspect-square md:max-h-none">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-contain p-3"
            sizes="(max-width:768px) 90vw, 50vw"
          />
          {pricing.onSale && (
            <span className="absolute left-3 top-3 rounded-full bg-orange px-3 py-1 text-xs font-bold text-cream">
              Save {pricing.percentOff}%
            </span>
          )}
        </div>
        <div className="min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-orange">
            {product.categories?.[0]?.name}
          </span>
          <h2 className="font-display mt-1 text-xl font-bold text-burgundy sm:text-2xl">
            {product.name}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {product.shortDescription}
          </p>
          <p className="mt-3 font-display text-xl font-bold text-burgundy sm:text-2xl">
            {formatPKR(pricing.finalPrice)}
            {pricing.onSale && (
              <span className="ml-2 text-base text-muted line-through">
                {formatPKR(pricing.originalPrice)}
              </span>
            )}
          </p>
          <div className="mt-5 sm:mt-6">
            <AddToCartPanel product={product} addons={productAddons} compact />
          </div>
          <Link
            href={`/menu/${product.slug}`}
            onClick={onClose}
            className="mt-4 inline-block text-sm font-medium text-burgundy underline-offset-4 hover:underline"
          >
            View full details →
          </Link>
        </div>
      </div>
    </Modal>
  );
}
