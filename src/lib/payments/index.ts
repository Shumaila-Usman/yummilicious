import { buildJazzCashCheckout, isJazzCashConfigured } from "@/lib/payments/jazzcash";
import { buildEasyPaisaCheckout, isEasyPaisaConfigured } from "@/lib/payments/easypaisa";

export type PaymentGateway = "stripe" | "jazzcash" | "easypaisa" | "none";

export type CheckoutPaymentMethod = "jazzcash" | "easypaisa" | "bank";

export interface RedirectPayment {
  type: "redirect";
  gateway: "jazzcash" | "easypaisa";
  actionUrl: string;
  fields: Record<string, string>;
}

export interface ManualPayment {
  type: "manual";
  gateway: "bank";
  message: string;
}

export function getConfiguredGateway(): PaymentGateway {
  const gw = process.env.PAYMENT_GATEWAY as PaymentGateway | undefined;
  if (gw && ["stripe", "jazzcash", "easypaisa"].includes(gw)) return gw;
  if (isJazzCashConfigured()) return "jazzcash";
  if (isEasyPaisaConfigured()) return "easypaisa";
  return "none";
}

export function isOnlinePaymentAvailable(): boolean {
  if (process.env.ONLINE_PAYMENT_ENABLED === "false") return false;
  return isJazzCashConfigured() || isEasyPaisaConfigured();
}

export function availablePaymentMethods(): CheckoutPaymentMethod[] {
  if (process.env.ONLINE_PAYMENT_ENABLED === "false") return [];
  const methods: CheckoutPaymentMethod[] = [];
  if (isJazzCashConfigured()) methods.push("jazzcash");
  if (isEasyPaisaConfigured()) methods.push("easypaisa");
  // Manual bank only when explicitly enabled (not secure by itself)
  if (process.env.ENABLE_BANK_TRANSFER === "true") methods.push("bank");
  return methods;
}

export function createCheckoutPayment(input: {
  method: CheckoutPaymentMethod;
  orderNumber: string;
  amountPkr: number;
  siteUrl: string;
}): RedirectPayment | ManualPayment {
  const returnBase = input.siteUrl.replace(/\/$/, "");

  if (input.method === "jazzcash") {
    const built = buildJazzCashCheckout({
      orderNumber: input.orderNumber,
      amountPkr: input.amountPkr,
      description: `Yummilicious ${input.orderNumber}`,
      returnUrl: `${returnBase}/api/payments/jazzcash/return`,
    });
    return { type: "redirect", gateway: "jazzcash", ...built };
  }

  if (input.method === "easypaisa") {
    const built = buildEasyPaisaCheckout({
      orderNumber: input.orderNumber,
      amountPkr: input.amountPkr,
      returnUrl: `${returnBase}/api/payments/easypaisa/return`,
    });
    return { type: "redirect", gateway: "easypaisa", ...built };
  }

  return {
    type: "manual",
    gateway: "bank",
    message:
      "Bank transfer orders stay pending until an admin verifies your payment.",
  };
}
