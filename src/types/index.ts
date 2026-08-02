export type OrderStatus =
  | "received"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "jazzcash" | "easypaisa" | "bank" | "cod" | "online";

export type DietaryTag = "vegetarian" | "non-vegetarian" | "spicy" | "contains-egg";

export interface IVariant {
  _id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  sku?: string;
  isDefault?: boolean;
  isAvailable?: boolean;
}

export interface IProductOptionChoice {
  label: string;
  priceModifier?: number;
}

export interface IProductOption {
  _id?: string;
  name: string;
  required: boolean;
  type: "single" | "multiple";
  choices: IProductOptionChoice[];
}

export interface ISaleConfig {
  enabled: boolean;
  type: "percentage" | "fixed" | "sale_price";
  value: number;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  showBadge?: boolean;
}

export interface IInventory {
  track: boolean;
  quantity: number;
  lowStockThreshold: number;
}

export interface CartAddon {
  addonId: string;
  name: string;
  size?: string;
  price: number;
  quantity: number;
}

export interface CartOptionSelection {
  optionName: string;
  choice: string;
  priceModifier?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  variant?: { name: string; price: number };
  options: CartOptionSelection[];
  addons: CartAddon[];
  quantity: number;
  unitPrice: number;
  specialInstructions?: string;
}

export interface OrderItemSnapshot {
  productId: string;
  slug: string;
  name: string;
  image: string;
  variant?: { name: string; price: number };
  options: CartOptionSelection[];
  addons: CartAddon[];
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  specialInstructions?: string;
}

export interface StoreHoursShift {
  label: string;
  start: string; // "09:00"
  end: string; // "12:00"
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Order Received",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "received",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
];
