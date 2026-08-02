"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Minus,
  MessageCircle,
  Plus,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import {
  CONTACT,
  PREORDER_PAYMENT,
  getProductImage,
  type StoreProduct,
} from "@/lib/data/fallback";
import { formatPhone, formatPKR } from "@/lib/utils/format";
import { minPreOrderDate, preOrderSchema } from "@/lib/validations";
import { cn } from "@/lib/utils/cn";
import type { z } from "zod";

type PreOrderForm = z.input<typeof preOrderSchema>;

type SelectedLine = {
  productId: string;
  slug: string;
  name: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  image: string;
};

const inputClass =
  "focus-ring w-full rounded-2xl border border-burgundy/12 bg-white/90 px-4 py-3 text-base text-brown placeholder:text-muted/50 transition hover:border-burgundy/25 sm:text-sm";

const TIME_WINDOWS = [
  { value: "morning", label: "Morning · 9 AM – 12 PM" },
  { value: "evening", label: "Evening · 8 PM – 11 PM" },
  { value: "custom", label: "Custom (mention in notes)" },
] as const;

const PAY_METHODS = [
  { value: "jazzcash", label: "JazzCash" },
  { value: "easypaisa", label: "EasyPaisa" },
  { value: "bank", label: "Bank Transfer" },
] as const;

function lineKey(productId: string, variantName?: string) {
  return `${productId}::${variantName ?? ""}`;
}

function unitPriceFor(product: StoreProduct, variantName?: string) {
  if (variantName && product.variants?.length) {
    const v = product.variants.find((x) => x.name === variantName);
    if (v) return v.price;
  }
  const def = product.variants?.find((v) => v.isDefault) || product.variants?.[0];
  return def?.price ?? product.basePrice;
}

function PreOrderHero() {
  return (
    <section className="relative overflow-hidden bg-[#FFF4DA]">
      <div
        className="pointer-events-none absolute -right-20 top-8 h-72 w-72 rounded-full bg-orange/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-burgundy/10 blur-3xl"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-3xl px-4 pb-10 pt-12 text-center sm:px-6 lg:pb-12 lg:pt-16">
        <ScrollReveal>
          <span className="font-script text-2xl text-orange sm:text-3xl">Bulk & Events</span>
          <h1 className="font-display mt-3 text-[2rem] font-bold tracking-tight text-burgundy sm:text-5xl">
            Pre Order
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Planning a gathering? Place your bulk order 1–2 days ahead. Full{" "}
            <span className="font-semibold text-burgundy">100% advance payment</span> confirms
            your booking.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.08} className="mt-8">
          <ul className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-3 text-sm">
            {[
              { icon: CalendarDays, text: "Order 1–2 days early" },
              { icon: Users, text: "Ideal for 5+ guests" },
              { icon: CreditCard, text: "100% payment upfront" },
            ].map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="inline-flex items-center gap-2 rounded-full border border-burgundy/12 bg-cream/80 px-4 py-2 text-brown shadow-sm"
              >
                <Icon className="h-4 w-4 text-orange" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function PreOrderClient({ products }: { products: StoreProduct[] }) {
  const available = useMemo(
    () => products.filter((p) => p.isAvailable && !p.isSoldOut),
    [products]
  );

  const [step, setStep] = useState<"menu" | "checkout">("menu");
  const [variantPick, setVariantPick] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of available) {
      if (p.variants?.length) {
        const def = p.variants.find((v) => v.isDefault) || p.variants[0];
        if (def) init[p._id] = def.name;
      }
    }
    return init;
  });
  const [selected, setSelected] = useState<Record<string, SelectedLine>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedNumber, setSubmittedNumber] = useState<string | null>(null);
  const minDate = useMemo(() => minPreOrderDate(), []);

  const selectedList = useMemo(() => Object.values(selected), [selected]);
  const itemCount = selectedList.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = selectedList.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PreOrderForm>({
    resolver: zodResolver(preOrderSchema),
    defaultValues: {
      customer: { fullName: "", phone: "", alternatePhone: "", email: "" },
      event: {
        date: minDate,
        timeWindow: "morning",
        occasion: "",
        guestCount: 10,
      },
      delivery: {
        address: "",
        area: "",
        city: "Islamabad",
        landmark: "",
        instructions: "",
      },
      items: [],
      orderDetails: "",
      estimatedTotal: 0,
      payment: {
        method: "jazzcash",
        amountPaid: 0,
        transactionId: "",
        paidInFull: false,
      },
    },
  });

  const payMethod = watch("payment.method");

  const setQty = (product: StoreProduct, quantity: number) => {
    const variantName = product.variants?.length
      ? variantPick[product._id] || product.variants[0]?.name
      : undefined;
    const key = lineKey(product._id, variantName);
    setSelected((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[key];
        return next;
      }
      next[key] = {
        productId: product._id,
        slug: product.slug,
        name: product.name,
        variantName,
        unitPrice: unitPriceFor(product, variantName),
        quantity: Math.min(500, quantity),
        image: getProductImage(product),
      };
      return next;
    });
  };

  const changeVariant = (product: StoreProduct, variantName: string) => {
    const oldKey = lineKey(
      product._id,
      variantPick[product._id] || product.variants?.[0]?.name
    );
    const qty = selected[oldKey]?.quantity ?? 0;
    setVariantPick((p) => ({ ...p, [product._id]: variantName }));
    setSelected((prev) => {
      const next = { ...prev };
      if (prev[oldKey]) delete next[oldKey];
      if (qty > 0) {
        const key = lineKey(product._id, variantName);
        next[key] = {
          productId: product._id,
          slug: product.slug,
          name: product.name,
          variantName,
          unitPrice: unitPriceFor(product, variantName),
          quantity: qty,
          image: getProductImage(product),
        };
      }
      return next;
    });
  };

  const goCheckout = () => {
    if (selectedList.length === 0) {
      toast.error("Select at least one product");
      return;
    }
    const items = selectedList.map(({ image: _img, ...rest }) => rest);
    setValue("items", items, { shouldValidate: true });
    setValue("estimatedTotal", cartTotal, { shouldValidate: true });
    setValue("payment.amountPaid", cartTotal, { shouldValidate: true });
    setStep("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: PreOrderForm) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        items: selectedList.map(({ image: _i, ...rest }) => rest),
        estimatedTotal: cartTotal,
        payment: { ...data.payment, amountPaid: Number(data.payment.amountPaid) },
      };
      const res = await fetch("/api/pre-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        const detail =
          json?.details?.fieldErrors &&
          Object.values(json.details.fieldErrors as Record<string, string[]>)
            .flat()
            .find(Boolean);
        throw new Error(detail || json.error || "Failed to submit");
      }
      setSubmittedNumber(json.preOrderNumber);
      toast.success(json.message || "Pre-order submitted!");
      reset();
      setSelected({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedNumber) {
    return (
      <PageTransition>
        <section className="bg-surface px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-lg rounded-[2rem] border border-burgundy/10 bg-cream p-8 text-center shadow-warm sm:p-10">
            <CheckCircle2 className="mx-auto h-14 w-14 text-green" aria-hidden />
            <h1 className="font-display mt-5 text-3xl font-bold text-burgundy">
              Pre-order received
            </h1>
            <p className="mt-3 text-muted">
              Your reference is{" "}
              <span className="font-semibold text-burgundy">{submittedNumber}</span>.
              We’ll verify payment and confirm on WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
                  `Hi Yummilicious! I submitted pre-order ${submittedNumber}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full gap-2 sm:w-auto" variant="secondary">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp us
                </Button>
              </a>
              <Link href="/menu">
                <Button variant="outline" className="w-full sm:w-auto">
                  Browse Menu
                </Button>
              </Link>
            </div>
            <button
              type="button"
              onClick={() => {
                setSubmittedNumber(null);
                setStep("menu");
              }}
              className="mt-6 text-sm font-medium text-burgundy underline-offset-4 hover:underline"
            >
              Place another pre-order
            </button>
          </div>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PreOrderHero />

      {step === "menu" ? (
        <section className="bg-surface pb-28 lg:pb-32">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <ScrollReveal className="mb-8 text-center sm:mb-10">
              <h2 className="font-display text-2xl font-bold text-burgundy sm:text-3xl">
                Choose your dishes
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted sm:text-base">
                Select multiple items and set quantities for your bulk order, then proceed to
                checkout.
              </p>
            </ScrollReveal>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {available.map((product, index) => {
                const variants = product.variants ?? [];
                const hasVariants = variants.length > 0;
                const currentVariant = hasVariants
                  ? variantPick[product._id] || variants[0]?.name
                  : undefined;
                const key = lineKey(product._id, currentVariant);
                const qty = selected[key]?.quantity ?? 0;
                const price = unitPriceFor(product, currentVariant);
                const image = getProductImage(product);

                return (
                  <article
                    key={product._id}
                    className={cn(
                      "flex flex-col overflow-hidden rounded-3xl border bg-white/80 shadow-warm transition",
                      qty > 0 ? "border-burgundy/40 ring-2 ring-burgundy/15" : "border-burgundy/10"
                    )}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="relative aspect-[4/3] bg-cream/80">
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width:640px) 100vw, 25vw"
                      />
                      {product.categories?.[0] && (
                        <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-orange">
                          {product.categories[0].name}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-display text-lg font-bold text-brown">{product.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted">
                        {product.shortDescription}
                      </p>
                      <p className="font-display mt-2 text-lg font-bold text-burgundy">
                        {formatPKR(price)}
                        {hasVariants && (
                          <span className="ml-1 text-xs font-normal text-muted">/ size</span>
                        )}
                      </p>

                      {hasVariants && (
                        <select
                          value={currentVariant}
                          onChange={(e) => changeVariant(product, e.target.value)}
                          className="focus-ring mt-3 w-full rounded-xl border border-burgundy/15 bg-cream px-3 py-2 text-sm"
                          aria-label={`Size for ${product.name}`}
                        >
                          {variants.map((v) => (
                            <option key={v.name} value={v.name}>
                              {v.name} · {formatPKR(v.price)}
                            </option>
                          ))}
                        </select>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                        {qty === 0 ? (
                          <Button
                            type="button"
                            variant="secondary"
                            className="w-full gap-2"
                            onClick={() => setQty(product, 1)}
                          >
                            <Plus className="h-4 w-4" />
                            Add
                          </Button>
                        ) : (
                          <div className="flex w-full items-center justify-between rounded-full border border-burgundy/15 bg-cream px-1 py-1">
                            <button
                              type="button"
                              onClick={() => setQty(product, qty - 1)}
                              className="focus-ring rounded-full p-2 hover:bg-burgundy/10"
                              aria-label="Decrease"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-[2rem] text-center text-base font-bold">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(product, qty + 1)}
                              className="focus-ring rounded-full p-2 hover:bg-burgundy/10"
                              aria-label="Increase"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Sticky proceed bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-burgundy/10 bg-cream/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_-16px_rgba(158,11,24,0.35)] backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-sm text-brown">
                <ShoppingBag className="h-5 w-5 text-burgundy" aria-hidden />
                <div>
                  <p className="font-semibold">
                    {itemCount} {itemCount === 1 ? "item" : "items"} selected
                  </p>
                  <p className="font-display text-lg font-bold text-burgundy">
                    {formatPKR(cartTotal)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                magnetic
                disabled={itemCount === 0}
                onClick={goCheckout}
                className="w-full sm:w-auto"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-surface pb-16 lg:pb-24">
          <div className="mx-auto max-w-3xl px-4 lg:px-6">
            <button
              type="button"
              onClick={() => setStep("menu")}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-burgundy hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to products
            </button>

            {/* Order summary */}
            <div className="mb-6 rounded-[1.5rem] border border-burgundy/10 bg-white/70 p-4 sm:p-5">
              <h2 className="font-display text-lg font-bold text-burgundy">Your selection</h2>
              <ul className="mt-3 space-y-3">
                {selectedList.map((item) => (
                  <li key={lineKey(item.productId, item.variantName)} className="flex gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream">
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        className="object-contain p-1"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-brown">
                        {item.quantity}× {item.name}
                        {item.variantName ? ` (${item.variantName})` : ""}
                      </p>
                      <p className="text-sm text-burgundy">
                        {formatPKR(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-burgundy/10 pt-3 font-display text-xl font-bold text-burgundy">
                <span>Total</span>
                <span>{formatPKR(cartTotal)}</span>
              </div>
            </div>

            <ScrollReveal>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-8 rounded-[2rem] border border-burgundy/10 bg-cream p-5 shadow-warm sm:p-8 lg:p-10"
              >
                <fieldset className="space-y-4">
                  <legend className="font-display flex items-center gap-2 text-xl font-bold text-burgundy">
                    <ClipboardList className="h-5 w-5 text-orange" aria-hidden />
                    Your details
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-brown">
                        Full name *
                      </label>
                      <input {...register("customer.fullName")} className={inputClass} />
                      {errors.customer?.fullName && (
                        <p className="mt-1 text-xs text-burgundy">
                          {errors.customer.fullName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-brown">
                        Phone (03XXXXXXXXX) *
                      </label>
                      <input
                        {...register("customer.phone")}
                        inputMode="numeric"
                        placeholder="03XXXXXXXXX"
                        className={inputClass}
                      />
                      {errors.customer?.phone && (
                        <p className="mt-1 text-xs text-burgundy">
                          {errors.customer.phone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-brown">
                        Alternate phone{" "}
                        <span className="font-normal text-muted">(optional)</span>
                      </label>
                      <input
                        {...register("customer.alternatePhone")}
                        inputMode="numeric"
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-brown">
                        Email
                      </label>
                      <input type="email" {...register("customer.email")} className={inputClass} />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="space-y-4 border-t border-burgundy/10 pt-8">
                  <legend className="font-display flex items-center gap-2 text-xl font-bold text-burgundy">
                    <CalendarDays className="h-5 w-5 text-orange" aria-hidden />
                    Event & timing
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-brown">
                        Delivery / event date *
                      </label>
                      <input
                        type="date"
                        min={minDate}
                        {...register("event.date")}
                        className={inputClass}
                      />
                      {errors.event?.date && (
                        <p className="mt-1 text-xs text-burgundy">{errors.event.date.message}</p>
                      )}
                      <p className="mt-1 text-xs text-muted">
                        Minimum 1 day ahead (2 days preferred).
                      </p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-brown">
                        Guests *
                      </label>
                      <input
                        type="number"
                        min={5}
                        {...register("event.guestCount", { valueAsNumber: true })}
                        className={inputClass}
                      />
                      {errors.event?.guestCount && (
                        <p className="mt-1 text-xs text-burgundy">
                          {errors.event.guestCount.message}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-brown">
                        Time window *
                      </label>
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        {TIME_WINDOWS.map((tw) => (
                          <label
                            key={tw.value}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition",
                              watch("event.timeWindow") === tw.value
                                ? "border-burgundy bg-burgundy text-cream"
                                : "border-burgundy/15 bg-white text-brown hover:border-burgundy/35"
                            )}
                          >
                            <input
                              type="radio"
                              value={tw.value}
                              {...register("event.timeWindow")}
                              className="sr-only"
                            />
                            {tw.label}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-brown">
                        Occasion
                      </label>
                      <input
                        {...register("event.occasion")}
                        placeholder="Office breakfast, family gathering…"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="space-y-4 border-t border-burgundy/10 pt-8">
                  <legend className="font-display text-xl font-bold text-burgundy">
                    Delivery address
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-brown">
                        Street address *
                      </label>
                      <input {...register("delivery.address")} className={inputClass} />
                      {errors.delivery?.address && (
                        <p className="mt-1 text-xs text-burgundy">
                          {errors.delivery.address.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-brown">
                        Area *
                      </label>
                      <input {...register("delivery.area")} className={inputClass} />
                      {errors.delivery?.area && (
                        <p className="mt-1 text-xs text-burgundy">
                          {errors.delivery.area.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-brown">
                        City *
                      </label>
                      <input {...register("delivery.city")} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-brown">
                        Landmark
                      </label>
                      <input {...register("delivery.landmark")} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-brown">
                        Special delivery notes
                      </label>
                      <textarea
                        rows={2}
                        {...register("delivery.instructions")}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-brown">
                        Extra notes for kitchen
                      </label>
                      <textarea
                        rows={2}
                        {...register("orderDetails")}
                        placeholder="Allergies, packaging, serving style…"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="space-y-4 border-t border-burgundy/10 pt-8">
                  <legend className="font-display flex items-center gap-2 text-xl font-bold text-burgundy">
                    <CreditCard className="h-5 w-5 text-orange" aria-hidden />
                    Pay 100% in advance
                  </legend>

                  <div className="rounded-2xl border border-orange/30 bg-orange/10 px-4 py-4 text-sm text-brown">
                    <p className="font-semibold text-burgundy">{PREORDER_PAYMENT.note}</p>
                    <p className="mt-3">
                      Send to <span className="font-semibold">{PREORDER_PAYMENT.accountName}</span>
                    </p>
                    <ul className="mt-2 space-y-1">
                      <li>
                        JazzCash:{" "}
                        <span className="font-semibold">
                          {formatPhone(PREORDER_PAYMENT.jazzcash)}
                        </span>
                      </li>
                      <li>
                        EasyPaisa:{" "}
                        <span className="font-semibold">
                          {formatPhone(PREORDER_PAYMENT.easypaisa)}
                        </span>
                      </li>
                    </ul>
                    <p className="mt-2 text-muted">
                      Amount due:{" "}
                      <span className="font-bold text-burgundy">{formatPKR(cartTotal)}</span>
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-brown">
                      Payment method *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PAY_METHODS.map((m) => (
                        <label
                          key={m.value}
                          className={cn(
                            "cursor-pointer rounded-full border px-4 py-2.5 text-sm font-medium transition",
                            payMethod === m.value
                              ? "border-burgundy bg-burgundy text-cream"
                              : "border-burgundy/15 bg-white text-brown hover:border-burgundy/35"
                          )}
                        >
                          <input
                            type="radio"
                            value={m.value}
                            {...register("payment.method")}
                            className="sr-only"
                          />
                          {m.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-brown">
                        Amount paid (PKR) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        {...register("payment.amountPaid", { valueAsNumber: true })}
                        className={inputClass}
                      />
                      {errors.payment?.amountPaid && (
                        <p className="mt-1 text-xs text-burgundy">
                          {errors.payment.amountPaid.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-brown">
                        Transaction / TID *
                      </label>
                      <input
                        {...register("payment.transactionId")}
                        placeholder="e.g. 1234567890"
                        className={inputClass}
                      />
                      {errors.payment?.transactionId && (
                        <p className="mt-1 text-xs text-burgundy">
                          {errors.payment.transactionId.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-burgundy/15 bg-white/70 px-4 py-3">
                    <input
                      type="checkbox"
                      {...register("payment.paidInFull")}
                      className="mt-1 accent-burgundy"
                    />
                    <span className="text-sm text-brown">
                      I confirm I have paid{" "}
                      <strong className="text-burgundy">100% of the estimated total</strong> in
                      advance and understand my pre-order is confirmed only after payment
                      verification.
                    </span>
                  </label>
                  {errors.payment?.paidInFull && (
                    <p className="text-xs text-burgundy">{errors.payment.paidInFull.message}</p>
                  )}
                </fieldset>

                <Button
                  type="submit"
                  size="lg"
                  loading={submitting}
                  magnetic
                  className="w-full"
                  variant="secondary"
                >
                  Submit Pre-Order · {formatPKR(cartTotal)}
                </Button>
              </form>
            </ScrollReveal>
          </div>
        </section>
      )}
    </PageTransition>
  );
}
