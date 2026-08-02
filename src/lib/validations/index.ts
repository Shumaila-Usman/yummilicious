import { z } from "zod";

/** Empty string or valid PK mobile (03XXXXXXXXX) */
const optionalPkPhone = z
  .string()
  .trim()
  .refine((v) => v === "" || /^03\d{9}$/.test(v), {
    message: "Enter a valid Pakistani mobile number (03XXXXXXXXX)",
  });

export const checkoutSchema = z.object({
  customer: z.object({
    fullName: z.string().min(2, "Name is required").max(100),
    phone: z
      .string()
      .regex(/^03\d{9}$/, "Enter a valid Pakistani mobile number (03XXXXXXXXX)"),
    alternatePhone: optionalPkPhone,
    email: z.string().email().optional().or(z.literal("")),
  }),
  delivery: z.object({
    address: z.string().min(5, "Address is required"),
    area: z.string().min(2, "Area is required"),
    city: z.string().min(2).default("Karachi"),
    landmark: z.string().optional(),
    instructions: z.string().max(500).optional(),
    preferredTime: z.string().optional(),
  }),
  paymentMethod: z.enum(["jazzcash", "easypaisa", "bank"]),
  /** Required only for manual bank transfer */
  transactionId: z.string().max(80).optional().default(""),
  paymentConfirmed: z.boolean().optional().default(false),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(20),
        variantName: z.string().optional(),
        options: z
          .array(
            z.object({
              optionName: z.string(),
              choice: z.string(),
            })
          )
          .default([]),
        addons: z
          .array(
            z.object({
              addonId: z.string(),
              quantity: z.number().int().min(1).max(10),
            })
          )
          .default([]),
        specialInstructions: z.string().max(300).optional(),
      })
    )
    .min(1, "Cart is empty"),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === "bank") {
    if (!data.transactionId || data.transactionId.trim().length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Transaction / TID is required for bank transfer",
        path: ["transactionId"],
      });
    }
    if (!data.paymentConfirmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Confirm that you have completed the bank transfer",
        path: ["paymentConfirmed"],
      });
    }
  }
});

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().max(150).optional(),
  message: z.string().min(10).max(2000),
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(5),
  phone: z.string().min(10),
});

export function minPreOrderDate(): string {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [y, m, d] = today.split("-").map(Number);
  const next = new Date(y, m - 1, d + 1);
  const yy = next.getFullYear();
  const mm = String(next.getMonth() + 1).padStart(2, "0");
  const dd = String(next.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export const preOrderSchema = z
  .object({
    customer: z.object({
      fullName: z.string().min(2, "Name is required").max(100),
      phone: z
        .string()
        .regex(/^03\d{9}$/, "Enter a valid Pakistani mobile number (03XXXXXXXXX)"),
      alternatePhone: optionalPkPhone,
      email: z.string().email("Enter a valid email").optional().or(z.literal("")),
    }),
    event: z.object({
      date: z.string().min(10, "Event date is required"),
      timeWindow: z.enum(["morning", "evening", "custom"]),
      occasion: z.string().max(120).optional().or(z.literal("")),
      guestCount: z.coerce.number().int().min(5, "Minimum 5 guests for pre-orders").max(500),
    }),
    delivery: z.object({
      address: z.string().min(5, "Address is required"),
      area: z.string().min(2, "Area is required"),
      city: z.string().min(2).default("Islamabad"),
      landmark: z.string().max(150).optional().or(z.literal("")),
      instructions: z.string().max(500).optional().or(z.literal("")),
    }),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          slug: z.string().min(1),
          name: z.string().min(1),
          variantName: z.string().optional(),
          unitPrice: z.number().min(0),
          quantity: z.number().int().min(1).max(500),
        })
      )
      .min(1, "Select at least one product"),
    orderDetails: z.string().max(3000).optional().or(z.literal("")),
    estimatedTotal: z.coerce.number().min(1, "Order total is required"),
    payment: z.object({
      method: z.enum(["jazzcash", "easypaisa", "bank"]),
      amountPaid: z.coerce.number().min(1, "Enter the amount you paid"),
      transactionId: z
        .string()
        .min(4, "Transaction / reference ID is required")
        .max(80),
      paidInFull: z
        .boolean()
        .refine((v) => v === true, { message: "You must confirm 100% advance payment" }),
    }),
  })
  .superRefine((data, ctx) => {
    const min = minPreOrderDate();
    if (data.event.date < min) {
      ctx.addIssue({
        code: "custom",
        path: ["event", "date"],
        message: "Pre-orders must be placed at least 1 day in advance",
      });
    }
    const itemsTotal = data.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    if (Math.abs(itemsTotal - data.estimatedTotal) > 1) {
      ctx.addIssue({
        code: "custom",
        path: ["estimatedTotal"],
        message: "Estimated total must match your selected items",
      });
    }
    if (data.payment.amountPaid + 0.01 < data.estimatedTotal) {
      ctx.addIssue({
        code: "custom",
        path: ["payment", "amountPaid"],
        message: "Amount paid must cover 100% of your estimated total",
      });
    }
  });

export const productSchema = z.object({
  name: z.string().min(2),
  shortDescription: z.string().min(10),
  fullDescription: z.string().min(10),
  basePrice: z.number().min(0),
  categories: z.array(z.string()).min(1),
  variants: z
    .array(
      z.object({
        name: z.string(),
        price: z.number().min(0),
        isDefault: z.boolean().optional(),
        isAvailable: z.boolean().optional(),
      })
    )
    .optional(),
  options: z
    .array(
      z.object({
        name: z.string(),
        required: z.boolean(),
        type: z.enum(["single", "multiple"]),
        choices: z.array(
          z.object({
            label: z.string(),
            priceModifier: z.number().optional(),
          })
        ),
      })
    )
    .optional(),
  addonIds: z.array(z.string()).optional(),
  images: z
    .array(
      z.object({
        url: z.string(),
        alt: z.string().optional(),
        publicId: z.string().optional(),
        order: z.number().optional(),
      })
    )
    .optional(),
  featuredImage: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
  dietaryTags: z.array(z.string()).optional(),
  includes: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  isSoldOut: z.boolean().optional(),
  preparationTime: z.number().optional(),
  displayOrder: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  sale: z
    .object({
      enabled: z.boolean(),
      type: z.enum(["percentage", "fixed", "sale_price"]),
      value: z.number(),
      startDate: z.string().nullable().optional(),
      endDate: z.string().nullable().optional(),
      showBadge: z.boolean().optional(),
    })
    .optional(),
  inventory: z
    .object({
      track: z.boolean(),
      quantity: z.number(),
      lowStockThreshold: z.number(),
    })
    .optional(),
});

export const addonSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().min(0),
  originalPrice: z.number().optional(),
  salePrice: z.number().optional(),
  size: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
  applicableProducts: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional(),
  maxQuantity: z.number().min(1).optional(),
  displayOrder: z.number().optional(),
});
