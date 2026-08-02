"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/animations/PageTransition";
import { useCartStore } from "@/store/cart";
import { formatPKR } from "@/lib/utils/format";
import { useStoreStatus } from "@/hooks/useStoreStatus";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const { open: storeOpen, message } = useStoreStatus();

  return (
    <PageTransition>
      <div className="bg-surface py-8 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 lg:px-6">
          <h1 className="font-display mb-6 text-2xl font-bold text-burgundy sm:mb-8 sm:text-4xl">
            Your Cart
          </h1>

          {!storeOpen && (
            <div className="mb-6 rounded-2xl border border-burgundy/20 bg-burgundy/5 px-5 py-4 text-sm text-burgundy">
              {message}
            </div>
          )}

          {items.length === 0 ? (
            <div className="rounded-3xl border border-burgundy/10 bg-cream py-20 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-burgundy/30" />
              <p className="font-display mt-4 text-xl text-brown">Your cart is empty</p>
              <Link href="/menu" className="mt-6 inline-block">
                <Button>Browse Menu</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                {items.map((item) => {
                  const lineTotal =
                    (item.unitPrice +
                      item.addons.reduce((a, ad) => a + ad.price * ad.quantity, 0) +
                      item.options.reduce((a, o) => a + (o.priceModifier ?? 0), 0)) *
                    item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 rounded-2xl border border-burgundy/10 bg-cream p-3 sm:gap-4 sm:p-4"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <Link
                          href={`/menu/${item.slug}`}
                          className="truncate font-display font-bold text-brown hover:text-burgundy"
                        >
                          {item.name}
                        </Link>
                        {item.variant && (
                          <p className="truncate text-xs text-muted">{item.variant.name}</p>
                        )}
                        {item.options.length > 0 && (
                          <p className="line-clamp-2 text-xs text-muted">
                            {item.options.map((o) => o.choice).join(", ")}
                          </p>
                        )}
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                          <div className="flex items-center gap-1 rounded-full border border-burgundy/15 bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="focus-ring rounded-full p-2 hover:bg-burgundy/10"
                              aria-label="Decrease"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-[2rem] text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="focus-ring rounded-full p-2 hover:bg-burgundy/10"
                              aria-label="Increase"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <span className="font-bold text-burgundy">{formatPKR(lineTotal)}</span>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-burgundy/50 hover:text-burgundy"
                              aria-label="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="h-fit rounded-3xl border border-burgundy/10 bg-cream p-4 shadow-warm sm:p-6">
                <h2 className="font-display mb-4 text-xl font-bold text-burgundy">Order Summary</h2>
                <div className="flex justify-between gap-3 text-muted">
                  <span>Subtotal</span>
                  <span className="shrink-0">{formatPKR(subtotal)}</span>
                </div>
                <p className="mt-2 text-xs text-muted">Delivery fee calculated at checkout</p>
                <div className="my-4 border-t border-burgundy/10 pt-4">
                  <div className="flex justify-between gap-3 font-display text-xl font-bold text-burgundy">
                    <span>Total</span>
                    <span className="shrink-0">{formatPKR(subtotal)}</span>
                  </div>
                </div>
                <Link href="/checkout" className="block w-full">
                  <Button className="w-full" size="lg" disabled={!storeOpen}>
                    {storeOpen ? "Proceed to Checkout" : "Ordering Closed"}
                  </Button>
                </Link>
                <Link href="/menu" className="mt-3 block text-center text-sm text-burgundy hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
