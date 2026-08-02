import { NextResponse } from "next/server";
import { availablePaymentMethods, isOnlinePaymentAvailable } from "@/lib/payments";
import { isJazzCashConfigured } from "@/lib/payments/jazzcash";
import { isEasyPaisaConfigured } from "@/lib/payments/easypaisa";

export async function GET() {
  const methods = availablePaymentMethods();
  return NextResponse.json({
    available: isOnlinePaymentAvailable() || methods.includes("bank"),
    methods,
    gateways: {
      jazzcash: isJazzCashConfigured(),
      easypaisa: isEasyPaisaConfigured(),
      bank: process.env.ENABLE_BANK_TRANSFER === "true",
    },
  });
}
