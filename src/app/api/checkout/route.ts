import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { checkoutSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { Product } from "@/models/Product";
import { AddOn } from "@/models/AddOn";
import { Order } from "@/models/Order";
import { Customer } from "@/models/Customer";
import { Coupon } from "@/models/Coupon";
import {
  applySale,
  computeLineTotal,
  getEffectiveVariantPrice,
} from "@/lib/pricing/calculate";
import { isWithinOrderingHours, getOrderingHoursMessage } from "@/lib/utils/store-hours";
import {
  availablePaymentMethods,
  createCheckoutPayment,
  isOnlinePaymentAvailable,
} from "@/lib/payments";
import { generateOrderNumber } from "@/lib/utils/format";
import { getSettingsDoc, jsonValidationError } from "@/lib/api/helpers";
import { notifyOrderEmails } from "@/lib/email/templates";
import type { OrderItemSnapshot } from "@/types";
import type { IProduct } from "@/models/Product";
import type { IAddOn } from "@/models/AddOn";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`checkout:${ip}`, 5, 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please try again in a minute." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const data = parsed.data;
    await connectDB();

    const settings = await getSettingsDoc();
    const shifts = settings.businessHours?.length ? settings.businessHours : undefined;

    if (!settings.storeOpen) {
      return NextResponse.json(
        { error: "The store is temporarily closed. Please try again later." },
        { status: 403 }
      );
    }

    if (!isWithinOrderingHours(shifts, new Date())) {
      const hoursMsg = getOrderingHoursMessage(shifts);
      return NextResponse.json({ error: hoursMsg.message }, { status: 403 });
    }

    const allowedMethods = availablePaymentMethods();
    if (!allowedMethods.includes(data.paymentMethod)) {
      return NextResponse.json(
        {
          error: isOnlinePaymentAvailable()
            ? "That payment method is not available."
            : "Online payment gateway is not configured yet. Please contact the store.",
        },
        { status: 400 }
      );
    }

    if (
      (data.paymentMethod === "jazzcash" || data.paymentMethod === "easypaisa") &&
      !isOnlinePaymentAvailable()
    ) {
      return NextResponse.json(
        { error: "Online payment is not available right now." },
        { status: 400 }
      );
    }

    const productIds = [...new Set(data.items.map((i) => i.productId))];
    const products = await Product.find({
      _id: { $in: productIds },
      isDeleted: false,
    }).lean();

    const productMap = new Map(
      products.map((p) => [(p as { _id: { toString(): string } })._id.toString(), p as IProduct & { _id: { toString(): string } }])
    );

    const addonIds = [
      ...new Set(data.items.flatMap((i) => i.addons.map((a) => a.addonId))),
    ];
    const addons = addonIds.length
      ? await AddOn.find({ _id: { $in: addonIds }, isActive: true }).lean()
      : [];
    const addonMap = new Map(
      addons.map((a) => [(a as { _id: { toString(): string } })._id.toString(), a as IAddOn & { _id: { toString(): string } }])
    );

    const orderItems: OrderItemSnapshot[] = [];
    let subtotal = 0;

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      if (!product.isAvailable || product.isSoldOut) {
        return NextResponse.json(
          { error: `"${product.name}" is currently unavailable.` },
          { status: 400 }
        );
      }

      if (product.inventory?.track && product.inventory.quantity < item.quantity) {
        return NextResponse.json(
          { error: `"${product.name}" has insufficient stock.` },
          { status: 400 }
        );
      }

      let unitBase: number;
      let variantSnapshot: { name: string; price: number } | undefined;

      if (item.variantName) {
        const variant = product.variants?.find((v) => v.name === item.variantName);
        if (!variant || variant.isAvailable === false) {
          return NextResponse.json(
            { error: `Invalid or unavailable variant for "${product.name}".` },
            { status: 400 }
          );
        }
        const priced = getEffectiveVariantPrice(variant, product.sale);
        unitBase = priced.finalPrice;
        variantSnapshot = { name: variant.name, price: priced.finalPrice };
      } else {
        const priced = applySale(product.basePrice, product.sale);
        unitBase = priced.finalPrice;
      }

      for (const opt of product.options ?? []) {
        if (opt.required) {
          const selected = item.options.find((o) => o.optionName === opt.name);
          if (!selected) {
            return NextResponse.json(
              { error: `Please select "${opt.name}" for "${product.name}".` },
              { status: 400 }
            );
          }
        }
      }

      let optionModifiers = 0;
      const optionSnapshots: { optionName: string; choice: string; priceModifier?: number }[] = [];

      for (const sel of item.options) {
        const optDef = product.options?.find((o) => o.name === sel.optionName);
        if (!optDef) {
          return NextResponse.json(
            { error: `Invalid option "${sel.optionName}" for "${product.name}".` },
            { status: 400 }
          );
        }
        const choiceDef = optDef.choices.find((c) => c.label === sel.choice);
        if (!choiceDef) {
          return NextResponse.json(
            { error: `Invalid choice "${sel.choice}" for option "${sel.optionName}".` },
            { status: 400 }
          );
        }
        const modifier = choiceDef.priceModifier ?? 0;
        optionModifiers += modifier;
        optionSnapshots.push({
          optionName: sel.optionName,
          choice: sel.choice,
          priceModifier: modifier,
        });
      }

      let addonTotal = 0;
      const addonSnapshots: {
        addonId: string;
        name: string;
        size?: string;
        price: number;
        quantity: number;
      }[] = [];

      for (const sel of item.addons) {
        const addon = addonMap.get(sel.addonId);
        if (!addon) {
          return NextResponse.json(
            { error: `Addon not found: ${sel.addonId}` },
            { status: 400 }
          );
        }
        if (sel.quantity > addon.maxQuantity) {
          return NextResponse.json(
            { error: `Maximum ${addon.maxQuantity} of "${addon.name}" allowed.` },
            { status: 400 }
          );
        }
        const addonPrice = addon.price;
        addonTotal += addonPrice * sel.quantity;
        addonSnapshots.push({
          addonId: addon._id.toString(),
          name: addon.name,
          size: addon.size,
          price: addonPrice,
          quantity: sel.quantity,
        });
      }

      const lineTotal = computeLineTotal({
        unitBase,
        optionModifiers,
        addonTotal,
        quantity: item.quantity,
      });

      subtotal += lineTotal;

      orderItems.push({
        productId: product._id.toString(),
        slug: product.slug,
        name: product.name,
        image: product.featuredImage || product.images?.[0]?.url || "",
        variant: variantSnapshot,
        options: optionSnapshots,
        addons: addonSnapshots,
        quantity: item.quantity,
        unitPrice: unitBase + optionModifiers + addonTotal / item.quantity,
        lineTotal,
        specialInstructions: item.specialInstructions,
      });
    }

    if (subtotal < settings.minimumOrderValue) {
      return NextResponse.json(
        {
          error: `Minimum order value is PKR ${settings.minimumOrderValue}. Your subtotal is PKR ${subtotal}.`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    let couponCode: string | undefined;

    if (data.couponCode) {
      const coupon = await Coupon.findOne({
        code: data.couponCode.toUpperCase(),
        isActive: true,
      });

      if (!coupon) {
        return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
      }

      const now = new Date();
      if (coupon.startDate && coupon.startDate > now) {
        return NextResponse.json({ error: "This coupon is not yet active." }, { status: 400 });
      }
      if (coupon.endDate && coupon.endDate < now) {
        return NextResponse.json({ error: "This coupon has expired." }, { status: 400 });
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({ error: "This coupon has reached its usage limit." }, { status: 400 });
      }
      if (subtotal < coupon.minOrderValue) {
        return NextResponse.json(
          { error: `Minimum order of PKR ${coupon.minOrderValue} required for this coupon.` },
          { status: 400 }
        );
      }

      if (coupon.type === "percentage") {
        discount = Math.round((subtotal * coupon.value) / 100);
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      } else {
        discount = coupon.value;
      }
      discount = Math.min(discount, subtotal);
      couponCode = coupon.code;
      coupon.usedCount += 1;
      await coupon.save();
    }

    let deliveryFee = settings.deliveryFee ?? 150;
    if (settings.freeDeliveryMin && subtotal >= settings.freeDeliveryMin) {
      deliveryFee = 0;
    }

    let tax = 0;
    if (settings.taxEnabled && settings.taxRate > 0) {
      tax = Math.round(((subtotal - discount) * settings.taxRate) / 100);
    }

    const total = Math.max(0, subtotal - discount + deliveryFee + tax);

    const lastOrder = await Order.findOne({ orderNumber: /^YL-/ })
      .sort({ sequence: -1 })
      .select("sequence")
      .lean();

    // Fallback: continue sequence from any prior order numbering scheme
    const legacyLast =
      lastOrder ??
      (await Order.findOne().sort({ sequence: -1 }).select("sequence").lean());

    const sequence = (legacyLast?.sequence ?? 0) + 1;
    const orderNumber = generateOrderNumber(sequence);

    let customer = await Customer.findOne({ phone: data.customer.phone });
    if (customer) {
      customer.fullName = data.customer.fullName;
      if (data.customer.email) customer.email = data.customer.email;
      customer.orderCount += 1;
      customer.totalSpent += total;
      customer.lastOrderAt = new Date();
      await customer.save();
    } else {
      customer = await Customer.create({
        fullName: data.customer.fullName,
        phone: data.customer.phone,
        email: data.customer.email || undefined,
        orderCount: 1,
        totalSpent: total,
        lastOrderAt: new Date(),
        addresses: [
          {
            address: data.delivery.address,
            area: data.delivery.area,
            city: data.delivery.city,
            landmark: data.delivery.landmark,
          },
        ],
      });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.nextUrl.origin ||
      "http://localhost:3000";

    let payment;
    try {
      payment = createCheckoutPayment({
        method: data.paymentMethod,
        orderNumber,
        amountPkr: total,
        siteUrl,
      });
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Payment gateway could not be started.",
        },
        { status: 400 }
      );
    }

    const gatewayTxnRef =
      payment.type === "redirect" ? payment.fields.pp_TxnRefNo : undefined;

    const order = await Order.create({
      orderNumber,
      sequence,
      customer: {
        fullName: data.customer.fullName,
        phone: data.customer.phone,
        alternatePhone: data.customer.alternatePhone || undefined,
        email: data.customer.email || undefined,
      },
      delivery: data.delivery,
      items: orderItems,
      subtotal,
      discount,
      deliveryFee,
      tax,
      total,
      couponCode,
      paymentMethod: data.paymentMethod,
      paymentStatus: "pending",
      paymentTransactionId:
        payment.type === "manual"
          ? data.transactionId?.trim() || undefined
          : gatewayTxnRef,
      status: "received",
      statusHistory: [
        {
          status: "received",
          note:
            payment.type === "redirect"
              ? `Awaiting ${payment.gateway} payment`
              : "Awaiting bank transfer verification",
          changedAt: new Date(),
        },
      ],
      customerId: customer._id,
    });

    // Inventory only after wallet payment is verified (see jazzcash return).
    // Bank transfer still reserves stock when TID is submitted.
    if (payment.type === "manual") {
      for (const item of data.items) {
        const product = productMap.get(item.productId);
        if (product?.inventory?.track) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { "inventory.quantity": -item.quantity },
          });
        }
      }
      notifyOrderEmails(order.toObject(), { paid: false });
    }

    return NextResponse.json(
      {
        orderNumber: order.orderNumber,
        orderId: order._id.toString(),
        total,
        payment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/checkout:", error);
    return NextResponse.json({ error: "Checkout failed. Please try again." }, { status: 500 });
  }
}
