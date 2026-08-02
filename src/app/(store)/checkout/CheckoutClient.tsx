"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, CreditCard, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/animations/PageTransition";
import { useCartStore } from "@/store/cart";
import { useStoreStatus } from "@/hooks/useStoreStatus";
import { ONLINE_PAYMENT } from "@/lib/data/fallback";
import { formatPhone, formatPKR } from "@/lib/utils/format";
import { checkoutSchema } from "@/lib/validations";
import { cn } from "@/lib/utils/cn";
import type { z } from "zod";

type CheckoutForm = z.input<typeof checkoutSchema>;
type PayMethod = "jazzcash" | "easypaisa" | "bank";

const STEPS = ["Details", "Address", "Payment", "Review"];

const METHOD_LABELS: Record<PayMethod, string> = {
  jazzcash: "JazzCash",
  easypaisa: "EasyPaisa",
  bank: "Bank Transfer",
};

function postToGateway(actionUrl: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;
  form.style.display = "none";
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getSubtotal, couponCode, setCoupon, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const { open: storeOpen, message, minimumOrderValue } = useStoreStatus();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [couponInput, setCouponInput] = useState(couponCode ?? "");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(150);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [payMethods, setPayMethods] = useState<PayMethod[]>([]);
  const [methodsLoaded, setMethodsLoaded] = useState(false);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer: { fullName: "", phone: "", alternatePhone: "", email: "" },
      delivery: { address: "", area: "", city: "Islamabad", landmark: "", instructions: "" },
      paymentMethod: "jazzcash",
      transactionId: "",
      paymentConfirmed: false,
      couponCode: couponCode ?? undefined,
      items: [],
    },
  });

  const paymentMethod = form.watch("paymentMethod");
  const isGatewayPay = paymentMethod === "jazzcash" || paymentMethod === "easypaisa";

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "failed") {
      const reason = searchParams.get("reason");
      toast.error(reason || "Payment failed or was cancelled. Please try again.");
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/payments/methods")
      .then((r) => r.json())
      .then((data: { methods?: PayMethod[] }) => {
        const methods = data.methods ?? [];
        setPayMethods(methods);
        if (methods.length) {
          form.setValue("paymentMethod", methods[0]);
        }
      })
      .catch(() => setPayMethods([]))
      .finally(() => setMethodsLoaded(true));
  }, [form]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        setDeliveryFee(s.deliveryFee ?? 150);
        if (s.freeDeliveryMin && subtotal >= s.freeDeliveryMin) setDeliveryFee(0);
      })
      .catch(() => {});
  }, [subtotal]);

  const validateCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon(data.code);
        setCouponDiscount(data.discount);
        form.setValue("couponCode", data.code);
        toast.success(`Coupon applied! You save ${formatPKR(data.discount)}`);
      } else {
        toast.error(data.error || "Invalid coupon");
        setCoupon(null);
        setCouponDiscount(0);
      }
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const total = Math.max(0, subtotal - couponDiscount + deliveryFee);

  const nextStep = async () => {
    let fields: (keyof CheckoutForm)[] = [];
    if (step === 0) fields = ["customer"];
    if (step === 1) fields = ["delivery"];
    if (step === 2) {
      fields = ["paymentMethod"];
      if (paymentMethod === "bank") {
        fields.push("transactionId", "paymentConfirmed");
      }
    }

    if (fields.length) {
      const valid = await form.trigger(fields);
      if (!valid) return;
    }

    if (step === 0 && subtotal < minimumOrderValue) {
      toast.error(`Minimum order is ${formatPKR(minimumOrderValue)}`);
      return;
    }

    if (step === 2 && payMethods.length === 0) {
      toast.error("Online payment is not set up yet. Please contact the store on WhatsApp.");
      return;
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submitOrder = async () => {
    if (!storeOpen) {
      toast.error("Ordering is currently closed", { description: message });
      return;
    }

    if (payMethods.length === 0) {
      toast.error("Online payment is not set up yet. Please contact the store.");
      return;
    }

    const valid = await form.trigger();
    if (!valid) return;

    setSubmitting(true);
    try {
      const values = form.getValues();
      const payload = {
        ...values,
        delivery: {
          ...values.delivery,
          city: values.delivery.city || "Islamabad",
        },
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          variantName: item.variant?.name,
          options: item.options.map((o) => ({
            optionName: o.optionName,
            choice: o.choice,
          })),
          addons: item.addons.map((a) => ({
            addonId: a.addonId,
            quantity: a.quantity,
          })),
          specialInstructions: item.specialInstructions,
        })),
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.payment?.type === "redirect" && data.payment.actionUrl) {
        clearCart();
        toast.message("Redirecting to secure payment…");
        postToGateway(data.payment.actionUrl, data.payment.fields);
        return;
      }

      clearCart();
      router.push(`/order-success?orderNumber=${data.orderNumber}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <PageTransition>
      <div className="bg-surface py-8 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <h1 className="font-display mb-6 text-2xl font-bold text-burgundy sm:mb-8 sm:text-4xl">
            Checkout
          </h1>

          {!storeOpen && (
            <div className="mb-6 rounded-2xl border border-burgundy/20 bg-burgundy/5 px-5 py-4 text-sm text-burgundy">
              {message}
            </div>
          )}

          <div className="mb-8 flex items-center justify-between gap-0.5 sm:mb-10 sm:gap-0">
            {STEPS.map((label, i) => (
              <div key={label} className="flex min-w-0 flex-1 items-center">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-8 sm:w-8 sm:text-sm ${
                    i <= step ? "bg-burgundy text-cream" : "bg-burgundy/10 text-muted"
                  }`}
                >
                  {i < step ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : i + 1}
                </div>
                <span className="ml-2 hidden text-sm font-medium sm:inline">{label}</span>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 flex-1 sm:mx-2 ${i < step ? "bg-burgundy" : "bg-burgundy/15"}`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-burgundy/10 bg-cream p-4 shadow-warm sm:p-6 lg:p-8">
            {step === 0 && (
              <div className="space-y-4">
                <div className="mb-4 flex items-center gap-2 text-burgundy">
                  <User className="h-5 w-5" />
                  <h2 className="font-display text-xl font-bold">Your Details</h2>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Full Name *</label>
                  <input
                    {...form.register("customer.fullName")}
                    className="focus-ring w-full rounded-xl border border-burgundy/15 bg-white px-4 py-2.5"
                  />
                  {form.formState.errors.customer?.fullName && (
                    <p className="mt-1 text-xs text-burgundy">
                      {form.formState.errors.customer.fullName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Phone (03XXXXXXXXX) *</label>
                  <input
                    {...form.register("customer.phone")}
                    placeholder="03XXXXXXXXX"
                    className="focus-ring w-full rounded-xl border border-burgundy/15 bg-white px-4 py-2.5"
                  />
                  {form.formState.errors.customer?.phone && (
                    <p className="mt-1 text-xs text-burgundy">
                      {form.formState.errors.customer.phone.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Alternate Phone{" "}
                    <span className="font-normal text-muted">(optional)</span>
                  </label>
                  <input
                    {...form.register("customer.alternatePhone")}
                    placeholder="03XXXXXXXXX"
                    className="focus-ring w-full rounded-xl border border-burgundy/15 bg-white px-4 py-2.5"
                  />
                  {form.formState.errors.customer?.alternatePhone && (
                    <p className="mt-1 text-xs text-burgundy">
                      {form.formState.errors.customer.alternatePhone.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    {...form.register("customer.email")}
                    className="focus-ring w-full rounded-xl border border-burgundy/15 bg-white px-4 py-2.5"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="mb-4 flex items-center gap-2 text-burgundy">
                  <MapPin className="h-5 w-5" />
                  <h2 className="font-display text-xl font-bold">Your address</h2>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Full Address *</label>
                  <textarea
                    rows={2}
                    {...form.register("delivery.address")}
                    className="focus-ring w-full rounded-xl border border-burgundy/15 bg-white px-4 py-2.5"
                  />
                  {form.formState.errors.delivery?.address && (
                    <p className="mt-1 text-xs text-burgundy">
                      {form.formState.errors.delivery.address.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Area *</label>
                    <input
                      {...form.register("delivery.area")}
                      className="focus-ring w-full rounded-xl border border-burgundy/15 bg-white px-4 py-2.5"
                    />
                    {form.formState.errors.delivery?.area && (
                      <p className="mt-1 text-xs text-burgundy">
                        {form.formState.errors.delivery.area.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">City</label>
                    <input
                      {...form.register("delivery.city")}
                      className="focus-ring w-full rounded-xl border border-burgundy/15 bg-white px-4 py-2.5"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Landmark</label>
                  <input
                    {...form.register("delivery.landmark")}
                    className="focus-ring w-full rounded-xl border border-burgundy/15 bg-white px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Delivery Instructions</label>
                  <textarea
                    rows={2}
                    {...form.register("delivery.instructions")}
                    className="focus-ring w-full rounded-xl border border-burgundy/15 bg-white px-4 py-2.5"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="mb-4 flex items-center gap-2 text-burgundy">
                  <CreditCard className="h-5 w-5" />
                  <h2 className="font-display text-xl font-bold">Pay securely</h2>
                </div>

                {methodsLoaded && payMethods.length === 0 && (
                  <div className="rounded-2xl border border-burgundy/20 bg-burgundy/5 px-4 py-4 text-sm text-burgundy">
                    Online payment is not configured yet. Message us on WhatsApp{" "}
                    <span className="font-semibold">{formatPhone(ONLINE_PAYMENT.jazzcash)}</span>{" "}
                    to place your order.
                  </div>
                )}

                {payMethods.length > 0 && isGatewayPay && (
                  <div className="rounded-2xl border border-orange/30 bg-orange/10 px-4 py-4 text-sm text-brown">
                    <p className="font-semibold text-burgundy">
                      You&apos;ll pay on JazzCash / EasyPaisa after placing the order.
                    </p>
                    <p className="mt-2 text-muted">
                      Your order is confirmed only after the payment gateway reports success —
                      unpaid orders are not fulfilled.
                    </p>
                    <p className="mt-2">
                      Amount due (incl. delivery {formatPKR(deliveryFee)}):{" "}
                      <span className="font-bold text-burgundy">{formatPKR(total)}</span>
                    </p>
                  </div>
                )}

                {paymentMethod === "bank" && (
                  <div className="rounded-2xl border border-orange/30 bg-orange/10 px-4 py-4 text-sm text-brown">
                    <p className="font-semibold text-burgundy">{ONLINE_PAYMENT.note}</p>
                    <p className="mt-2">
                      Transfer to{" "}
                      <span className="font-semibold">{ONLINE_PAYMENT.accountName}</span> and
                      enter your TID below. Orders stay pending until we verify.
                    </p>
                    <p className="mt-2">
                      Amount (incl. delivery):{" "}
                      <span className="font-bold text-burgundy">{formatPKR(total)}</span>
                    </p>
                  </div>
                )}

                {payMethods.length > 0 && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Payment method *</label>
                    <div className="flex flex-wrap gap-2">
                      {payMethods.map((m) => (
                        <label
                          key={m}
                          className={cn(
                            "cursor-pointer rounded-full border px-4 py-2.5 text-sm font-medium transition",
                            paymentMethod === m
                              ? "border-burgundy bg-burgundy text-cream"
                              : "border-burgundy/15 bg-white text-brown hover:border-burgundy/35"
                          )}
                        >
                          <input
                            type="radio"
                            value={m}
                            {...form.register("paymentMethod")}
                            className="sr-only"
                          />
                          {METHOD_LABELS[m]}
                        </label>
                      ))}
                    </div>
                    {form.formState.errors.paymentMethod && (
                      <p className="mt-1 text-xs text-burgundy">
                        {form.formState.errors.paymentMethod.message}
                      </p>
                    )}
                  </div>
                )}

                {paymentMethod === "bank" && (
                  <>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Transaction / TID *
                      </label>
                      <input
                        {...form.register("transactionId")}
                        placeholder="e.g. 1234567890"
                        className="focus-ring w-full rounded-xl border border-burgundy/15 bg-white px-4 py-2.5"
                      />
                      {form.formState.errors.transactionId && (
                        <p className="mt-1 text-xs text-burgundy">
                          {form.formState.errors.transactionId.message}
                        </p>
                      )}
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-burgundy/15 bg-white/70 px-4 py-3">
                      <input
                        type="checkbox"
                        {...form.register("paymentConfirmed")}
                        className="mt-1 accent-burgundy"
                      />
                      <span className="text-sm text-brown">
                        I confirm I have transferred{" "}
                        <strong className="text-burgundy">{formatPKR(total)}</strong> and
                        understand the order is confirmed after verification.
                      </span>
                    </label>
                    {form.formState.errors.paymentConfirmed && (
                      <p className="text-xs text-burgundy">
                        {form.formState.errors.paymentConfirmed.message}
                      </p>
                    )}
                  </>
                )}

                <div className="mt-2">
                  <label className="mb-2 block text-sm font-medium">Coupon Code</label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="focus-ring min-w-0 flex-1 rounded-xl border border-burgundy/15 bg-white px-4 py-2.5 uppercase"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={validateCoupon}
                      loading={validatingCoupon}
                      className="w-full shrink-0 sm:w-auto"
                    >
                      Apply
                    </Button>
                  </div>
                  {couponDiscount > 0 && (
                    <p className="mt-2 text-sm text-green">
                      Coupon applied — saving {formatPKR(couponDiscount)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-display mb-4 text-xl font-bold text-burgundy">Review Order</h2>
                <div className="space-y-2 rounded-2xl bg-white/60 p-3 sm:p-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                      <span className="min-w-0 flex-1 break-words">
                        {item.quantity}× {item.name}
                        {item.variant ? ` (${item.variant.name})` : ""}
                      </span>
                      <span className="shrink-0 font-medium">
                        {formatPKR(
                          (item.unitPrice +
                            item.addons.reduce((a, ad) => a + ad.price * ad.quantity, 0) +
                            item.options.reduce((a, o) => a + (o.priceModifier ?? 0), 0)) *
                            item.quantity
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t border-burgundy/10 pt-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span>Subtotal</span>
                    <span className="shrink-0">{formatPKR(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between gap-3 text-green">
                      <span>Discount</span>
                      <span className="shrink-0">-{formatPKR(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-3">
                    <span>Delivery Fee</span>
                    <span className="shrink-0">
                      {deliveryFee === 0 ? "FREE" : formatPKR(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 font-display text-lg font-bold text-burgundy sm:text-xl">
                    <span>Total</span>
                    <span className="shrink-0">{formatPKR(total)}</span>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  {isGatewayPay
                    ? `Pay with ${METHOD_LABELS[paymentMethod as PayMethod]} on the next screen · `
                    : `Bank transfer · TID ${form.watch("transactionId")} · `}
                  Delivering to {form.watch("delivery.area")}, {form.watch("delivery.city")}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="w-full gap-1 sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={nextStep} className="w-full gap-1 sm:w-auto">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={submitOrder}
                  loading={submitting}
                  disabled={!storeOpen || payMethods.length === 0}
                  magnetic
                  className="w-full text-sm sm:w-auto sm:text-base"
                >
                  {isGatewayPay
                    ? `Pay ${formatPKR(total)}`
                    : `Place Order · ${formatPKR(total)}`}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
