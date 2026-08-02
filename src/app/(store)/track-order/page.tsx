"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/animations/PageTransition";
import { formatPKR } from "@/lib/utils/format";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, type OrderStatus } from "@/types";

interface TrackResult {
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  timeline: { status: OrderStatus; label: string; changedAt: string }[];
  createdAt: string;
  total: number;
  items: { name: string; quantity: number; lineTotal: number }[];
}

function TrackOrderForm() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("orderNumber") ?? "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Not found");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to track order");
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = result
    ? ORDER_STATUS_FLOW.indexOf(result.status)
    : -1;

  return (
    <PageTransition>
      <div className="bg-surface py-12 lg:py-16">
        <div className="mx-auto max-w-2xl px-4 lg:px-6">
          <div className="mb-10 text-center">
            <Package className="mx-auto h-10 w-10 text-burgundy" />
            <h1 className="font-display mt-3 text-3xl font-bold text-burgundy sm:text-4xl">
              Track Order
            </h1>
            <p className="mt-2 text-muted">
              Enter your order number and phone to see real-time status.
            </p>
          </div>

          <form
            onSubmit={handleTrack}
            className="rounded-3xl border border-burgundy/10 bg-cream p-5 shadow-warm sm:p-6 lg:p-8"
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="orderNumber" className="mb-1 block text-sm font-medium">
                  Order Number
                </label>
                <input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  placeholder="YL-0001"
                  className="focus-ring w-full rounded-xl border border-burgundy/15 bg-white px-4 py-2.5 uppercase"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                  Phone Number
                </label>
                <input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03XXXXXXXXX"
                  className="focus-ring w-full rounded-xl border border-burgundy/15 bg-white px-4 py-2.5"
                  required
                />
              </div>
              <Button type="submit" loading={loading} className="w-full gap-2" size="lg">
                <Search className="h-4 w-4" />
                Track Order
              </Button>
            </div>
          </form>

          {error && (
            <p className="mt-4 rounded-xl bg-burgundy/10 px-4 py-3 text-center text-sm text-burgundy">
              {error}
            </p>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-3xl border border-burgundy/10 bg-cream p-6 shadow-warm"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Order</p>
                  <p className="font-display text-xl font-bold text-burgundy">
                    {result.orderNumber}
                  </p>
                </div>
                <div className="rounded-full bg-orange/15 px-4 py-1.5 text-sm font-semibold text-orange">
                  {result.statusLabel}
                </div>
              </div>

              <div className="mb-8">
                <p className="mb-3 text-center text-sm font-semibold text-burgundy sm:hidden">
                  Status: {result.statusLabel}
                </p>
                <div className="-mx-1 overflow-x-auto px-1 pb-1">
                  <div className="flex min-w-[18rem] justify-between gap-1">
                    {ORDER_STATUS_FLOW.map((status, i) => (
                      <div key={status} className="flex min-w-[2.75rem] flex-1 flex-col items-center">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold sm:h-8 sm:w-8 sm:text-xs ${
                            i <= currentIndex
                              ? "bg-burgundy text-cream"
                              : "bg-burgundy/10 text-muted"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <span className="mt-1 hidden text-[10px] text-muted sm:block">
                          {ORDER_STATUS_LABELS[status].split(" ")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-burgundy/10 pt-4">
                {result.items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 text-sm">
                    <span className="min-w-0 flex-1 break-words">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="shrink-0">{formatPKR(item.lineTotal)}</span>
                  </div>
                ))}
                <div className="flex justify-between gap-3 border-t border-burgundy/10 pt-2 font-display font-bold text-burgundy">
                  <span>Total</span>
                  <span className="shrink-0">{formatPKR(result.total)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderForm />
    </Suspense>
  );
}
