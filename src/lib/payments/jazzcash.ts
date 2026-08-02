import { createHmac } from "crypto";

export type JazzCashFormFields = Record<string, string>;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** JazzCash expects YYYYMMDDHHmmss in Pakistan time. */
export function jazzCashDateTime(d = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}${get("month")}${get("day")}${get("hour")}${get("minute")}${get("second")}`;
}

export function isJazzCashConfigured(): boolean {
  return Boolean(
    process.env.JAZZCASH_MERCHANT_ID &&
      process.env.JAZZCASH_PASSWORD &&
      process.env.JAZZCASH_INTEGRITY_SALT
  );
}

export function getJazzCashPostUrl(): string {
  const sandbox = process.env.JAZZCASH_SANDBOX !== "false";
  return sandbox
    ? "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/"
    : "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";
}

/**
 * Build JazzCash page-redirection payload (HMAC-SHA256).
 * Amount is in PKR; converted to paisa (×100) for the gateway.
 */
export function buildJazzCashCheckout(input: {
  orderNumber: string;
  amountPkr: number;
  description?: string;
  returnUrl: string;
}): { actionUrl: string; fields: JazzCashFormFields } {
  if (!isJazzCashConfigured()) {
    throw new Error("JazzCash is not configured. Set JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD, JAZZCASH_INTEGRITY_SALT.");
  }

  const merchantId = process.env.JAZZCASH_MERCHANT_ID!;
  const password = process.env.JAZZCASH_PASSWORD!;
  const salt = process.env.JAZZCASH_INTEGRITY_SALT!;
  const now = jazzCashDateTime();
  const expiry = jazzCashDateTime(new Date(Date.now() + 60 * 60 * 1000));
  const amountPaisa = String(Math.round(input.amountPkr * 100));
  // JazzCash txn ref: alphanumeric, keep unique
  const txnRef = `T${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;

  const fields: JazzCashFormFields = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_TxnRefNo: txnRef,
    pp_Amount: amountPaisa,
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: now,
    pp_BillReference: input.orderNumber.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20) || txnRef,
    pp_Description: (input.description || `Order ${input.orderNumber}`).slice(0, 100),
    pp_TxnExpiryDateTime: expiry,
    pp_ReturnURL: input.returnUrl,
    pp_mpf_1: input.orderNumber,
  };

  if (process.env.JAZZCASH_SUB_MERCHANT_ID) {
    fields.pp_SubMerchantID = process.env.JAZZCASH_SUB_MERCHANT_ID;
  }

  fields.pp_SecureHash = computeJazzCashHash(fields, salt);

  return { actionUrl: getJazzCashPostUrl(), fields };
}

export function computeJazzCashHash(
  fields: Record<string, string>,
  salt = process.env.JAZZCASH_INTEGRITY_SALT || ""
): string {
  const sorted = Object.keys(fields)
    .filter((k) => k !== "pp_SecureHash" && fields[k] !== undefined && fields[k] !== "")
    .sort();
  const payload = `${salt}&${sorted.map((k) => fields[k]).join("&")}`;
  return createHmac("sha256", salt).update(payload, "utf8").digest("hex").toUpperCase();
}

export function verifyJazzCashResponse(
  body: Record<string, string>
): { ok: boolean; responseCode: string; message: string; orderNumber?: string; txnRef?: string } {
  const salt = process.env.JAZZCASH_INTEGRITY_SALT || "";
  const received = (body.pp_SecureHash || "").toUpperCase();
  const expected = computeJazzCashHash(body, salt);
  const responseCode = body.pp_ResponseCode || "";
  const ok =
    Boolean(received) &&
    received === expected &&
    (responseCode === "000" || responseCode === "121" || responseCode === "200");

  return {
    ok,
    responseCode,
    message: body.pp_ResponseMessage || (ok ? "Payment successful" : "Payment failed or unverified"),
    orderNumber: body.pp_mpf_1 || body.pp_BillReference,
    txnRef: body.pp_TxnRefNo,
  };
}
