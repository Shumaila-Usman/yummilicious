export function formatPKR(amount: number): string {
  const rounded = Math.round(amount);
  return `PKR ${rounded.toLocaleString("en-PK")}`;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("03")) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return phone;
}

export function percentageOff(original: number, sale: number): number {
  if (original <= 0 || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
}

export function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Storefront order numbers: YL-0001, YL-0002, … */
export function generateOrderNumber(seq: number): string {
  return `YL-${String(seq).padStart(4, "0")}`;
}
