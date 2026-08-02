/**
 * EasyPaisa hosted checkout helpers.
 * Requires EASYPAISA_STORE_ID + EASYPAISA_HASH_KEY from merchant onboarding.
 */

export function isEasyPaisaConfigured(): boolean {
  return Boolean(process.env.EASYPAISA_STORE_ID && process.env.EASYPAISA_HASH_KEY);
}

export function getEasyPaisaCheckoutUrl(): string {
  const sandbox = process.env.EASYPAISA_SANDBOX !== "false";
  return (
    process.env.EASYPAISA_CHECKOUT_URL ||
    (sandbox
      ? "https://easypay.easypaisa.com.pk/easypay-v2/Index.jsf"
      : "https://easypay.easypaisa.com.pk/easypay/Index.jsf")
  );
}

/**
 * EasyPaisa hash is AES-based in official packs; once you receive the merchant
 * hash algorithm from Telenor, wire it here. Until then we surface a clear error.
 */
export function buildEasyPaisaCheckout(_input: {
  orderNumber: string;
  amountPkr: number;
  returnUrl: string;
}): { actionUrl: string; fields: Record<string, string> } {
  if (!isEasyPaisaConfigured()) {
    throw new Error(
      "EasyPaisa is not configured. Set EASYPAISA_STORE_ID and EASYPAISA_HASH_KEY from your merchant pack."
    );
  }

  throw new Error(
    "EasyPaisa hosted checkout needs your merchant hash pack from Telenor. JazzCash is ready — use that, or share EasyPaisa docs to finish this adapter."
  );
}
