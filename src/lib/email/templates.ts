import { formatPKR, formatPhone } from "@/lib/utils/format";
import { getOwnerEmail, sendEmailSafe } from "@/lib/email/send";
import { CONTACT } from "@/lib/data/fallback";

type OrderLike = {
  orderNumber: string;
  customer: {
    fullName: string;
    phone: string;
    alternatePhone?: string;
    email?: string;
  };
  delivery: {
    address: string;
    area: string;
    city: string;
    landmark?: string;
    instructions?: string;
  };
  items: {
    name: string;
    quantity: number;
    lineTotal: number;
    variant?: { name?: string };
    options?: { optionName: string; choice: string }[];
    addons?: { name: string; quantity: number; size?: string }[];
  }[];
  subtotal: number;
  discount?: number;
  deliveryFee?: number;
  tax?: number;
  total: number;
  paymentMethod: string;
  paymentStatus?: string;
  paymentTransactionId?: string;
  couponCode?: string;
};

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function itemsHtml(order: OrderLike) {
  return order.items
    .map((item) => {
      const bits = [
        item.variant?.name,
        ...(item.options?.map((o) => `${o.optionName}: ${o.choice}`) ?? []),
        ...(item.addons?.map(
          (a) => `${a.name}${a.size ? ` (${a.size})` : ""} ×${a.quantity}`
        ) ?? []),
      ].filter(Boolean);
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0e6d8;">
          <strong>${esc(String(item.quantity))}× ${esc(item.name)}</strong>
          ${bits.length ? `<div style="color:#6b4a3a;font-size:12px;margin-top:2px;">${esc(bits.join(" · "))}</div>` : ""}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f0e6d8;text-align:right;white-space:nowrap;">${esc(formatPKR(item.lineTotal))}</td>
      </tr>`;
    })
    .join("");
}

function wrap(title: string, body: string) {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#fff4da;font-family:Manrope,Segoe UI,sans-serif;color:#351a12;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#9e0b18;color:#fff4da;border-radius:16px 16px 0 0;padding:20px 24px;">
      <div style="font-size:20px;font-weight:700;">Yummilicious</div>
      <div style="opacity:.85;font-size:13px;margin-top:4px;">Homemade Comfort. Unforgettable Flavour.</div>
    </div>
    <div style="background:#ffffff;border:1px solid #e8d5c0;border-top:0;border-radius:0 0 16px 16px;padding:24px;">
      <h1 style="margin:0 0 12px;font-size:20px;color:#9e0b18;">${esc(title)}</h1>
      ${body}
      <p style="margin:24px 0 0;font-size:12px;color:#6b4a3a;">
        Questions? WhatsApp <a href="https://wa.me/${CONTACT.whatsapp}" style="color:#9e0b18;">${esc(formatPhone(CONTACT.phone))}</a>
        or email <a href="mailto:${CONTACT.email}" style="color:#9e0b18;">${CONTACT.email}</a>
      </p>
    </div>
  </div>
</body></html>`;
}

function orderSummaryBody(order: OrderLike, intro: string) {
  return `
    <p style="margin:0 0 16px;line-height:1.6;">${intro}</p>
    <p style="margin:0 0 8px;"><strong>Order:</strong> ${esc(order.orderNumber)}</p>
    <p style="margin:0 0 8px;"><strong>Payment:</strong> ${esc(order.paymentMethod.toUpperCase())}${order.paymentStatus ? ` · ${esc(order.paymentStatus)}` : ""}${order.paymentTransactionId ? ` · TID ${esc(order.paymentTransactionId)}` : ""}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsHtml(order)}</table>
    <div style="font-size:14px;line-height:1.7;">
      <div style="display:flex;justify-content:space-between;"><span>Subtotal</span><span>${esc(formatPKR(order.subtotal))}</span></div>
      ${(order.discount ?? 0) > 0 ? `<div style="display:flex;justify-content:space-between;color:#678e21;"><span>Discount${order.couponCode ? ` (${esc(order.couponCode)})` : ""}</span><span>-${esc(formatPKR(order.discount!))}</span></div>` : ""}
      <div style="display:flex;justify-content:space-between;"><span>Delivery</span><span>${esc(formatPKR(order.deliveryFee ?? 0))}</span></div>
      ${(order.tax ?? 0) > 0 ? `<div style="display:flex;justify-content:space-between;"><span>Tax</span><span>${esc(formatPKR(order.tax!))}</span></div>` : ""}
      <div style="display:flex;justify-content:space-between;font-weight:700;font-size:16px;margin-top:8px;color:#9e0b18;"><span>Total</span><span>${esc(formatPKR(order.total))}</span></div>
    </div>
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #f0e6d8;font-size:14px;line-height:1.6;">
      <strong>Customer</strong><br/>
      ${esc(order.customer.fullName)} · ${esc(formatPhone(order.customer.phone))}
      ${order.customer.alternatePhone ? ` · Alt ${esc(formatPhone(order.customer.alternatePhone))}` : ""}
      ${order.customer.email ? `<br/>${esc(order.customer.email)}` : ""}
      <br/><br/>
      <strong>Deliver to</strong><br/>
      ${esc(order.delivery.address)}<br/>
      ${esc(order.delivery.area)}, ${esc(order.delivery.city)}
      ${order.delivery.landmark ? `<br/>Landmark: ${esc(order.delivery.landmark)}` : ""}
      ${order.delivery.instructions ? `<br/>Notes: ${esc(order.delivery.instructions)}` : ""}
    </div>`;
}

export function notifyContactSubmission(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  const subject = data.subject?.trim()
    ? `Contact: ${data.subject.trim()}`
    : `New contact message from ${data.name}`;

  sendEmailSafe({
    to: getOwnerEmail(),
    subject,
    replyTo: data.email,
    html: wrap(
      "New contact form message",
      `<p><strong>From:</strong> ${esc(data.name)} &lt;${esc(data.email)}&gt;</p>
       ${data.phone ? `<p><strong>Phone:</strong> ${esc(data.phone)}</p>` : ""}
       <p style="white-space:pre-wrap;line-height:1.6;margin-top:16px;">${esc(data.message)}</p>`
    ),
    text: `From: ${data.name} <${data.email}>\nPhone: ${data.phone || "-"}\n\n${data.message}`,
  });
}

/** Owner + customer confirmation after a purchase is confirmed. */
export function notifyOrderEmails(order: OrderLike, opts?: { paid?: boolean }) {
  const paid = opts?.paid ?? order.paymentStatus === "paid";
  const ownerIntro = paid
    ? `New paid order <strong>${esc(order.orderNumber)}</strong> is ready to prepare.`
    : `New order <strong>${esc(order.orderNumber)}</strong> received (payment: ${esc(order.paymentStatus || "pending")}).`;

  sendEmailSafe({
    to: getOwnerEmail(),
    subject: `New order ${order.orderNumber} · ${formatPKR(order.total)}`,
    replyTo: order.customer.email || undefined,
    html: wrap(`Order ${order.orderNumber}`, orderSummaryBody(order, ownerIntro)),
  });

  if (order.customer.email) {
    sendEmailSafe({
      to: order.customer.email,
      subject: `Order confirmed · ${order.orderNumber} · Yummilicious`,
      html: wrap(
        "Thanks for your order!",
        orderSummaryBody(
          order,
          `Hi ${esc(order.customer.fullName)}, we've received your order <strong>${esc(order.orderNumber)}</strong>. We'll keep you updated as we prepare your food.`
        )
      ),
    });
  }
}
