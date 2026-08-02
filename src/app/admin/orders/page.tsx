"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/AdminProviders";
import { Button } from "@/components/ui/Button";
import { formatPKR, formatPhone } from "@/lib/utils/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW, type OrderStatus } from "@/types";

interface OrderListItem {
  _id: string;
  orderNumber: string;
  customer: { fullName: string; phone: string; email?: string };
  status: OrderStatus;
  total: number;
  paymentMethod: string;
  paymentStatus?: string;
  createdAt: string;
}

interface OrderDetail extends OrderListItem {
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
    preferredTime?: string;
  };
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    image?: string;
    specialInstructions?: string;
    variant?: { name: string; price?: number };
    options?: { optionName: string; choice: string; priceModifier?: number }[];
    addons?: { name: string; size?: string; price: number; quantity: number }[];
  }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  couponCode?: string;
  paymentTransactionId?: string;
  internalNotes?: string;
  statusHistory: { status: OrderStatus; note?: string; changedAt: string; changedBy?: string }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [statusNote, setStatusNote] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadOrders = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    adminFetch<{ orders: OrderListItem[] }>(`/api/orders?${params}`)
      .then((res) => {
        if (res.data) setOrders(res.data.orders);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(loadOrders, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search, statusFilter]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    adminFetch<OrderDetail>(`/api/orders/${selectedId}`)
      .then((res) => {
        if (res.data) {
          setDetail(res.data);
          setNewStatus(res.data.status);
          setInternalNotes(res.data.internalNotes ?? "");
        }
      })
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const handleUpdate = async () => {
    if (!selectedId) return;
    setUpdating(true);
    const body: Record<string, string> = {};
    if (newStatus && newStatus !== detail?.status) {
      body.status = newStatus;
      if (statusNote) body.statusNote = statusNote;
    }
    if (internalNotes !== (detail?.internalNotes ?? "")) {
      body.internalNotes = internalNotes;
    }
    const res = await adminFetch(`/api/orders/${selectedId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    setUpdating(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Order updated");
    setStatusNote("");
    loadOrders();
    // reload detail
    const refreshed = await adminFetch<OrderDetail>(`/api/orders/${selectedId}`);
    if (refreshed.data) {
      setDetail(refreshed.data);
      setNewStatus(refreshed.data.status);
      setInternalNotes(refreshed.data.internalNotes ?? "");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20";

  const waPhone = detail?.customer.phone?.replace(/\D/g, "").replace(/^0/, "92");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brown">Orders</h1>
        <p className="text-sm text-muted">Manage and track customer orders (YL-XXXX)</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search YL-0001, name, phone…"
            className={`${inputClass} pl-10`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={inputClass + " w-auto"}
        >
          <option value="">All statuses</option>
          {ORDER_STATUS_FLOW.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-2 lg:col-span-2">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-burgundy/5" />
            ))
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-burgundy/30 py-16 text-center text-muted">
              No orders found
            </div>
          ) : (
            orders.map((order) => (
              <button
                key={order._id}
                type="button"
                onClick={() => setSelectedId(order._id)}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  selectedId === order._id
                    ? "border-burgundy bg-burgundy/10"
                    : "border-burgundy/15 bg-white/60 hover:border-burgundy/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-brown">{order.orderNumber}</p>
                    <p className="text-sm text-muted">{order.customer.fullName}</p>
                  </div>
                  <p className="font-medium text-brown">{formatPKR(order.total)}</p>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-burgundy/10 px-2 py-0.5 text-xs font-medium text-burgundy">
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <span className="text-xs capitalize text-muted">
                    {order.paymentStatus || "pending"} · {order.paymentMethod}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {new Date(order.createdAt).toLocaleString("en-PK")}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-3">
          {!selectedId ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-burgundy/30 text-muted">
              Select an order to view complete details
            </div>
          ) : detailLoading ? (
            <div className="h-96 animate-pulse rounded-xl bg-burgundy/5" />
          ) : detail ? (
            <div className="space-y-6 rounded-xl border border-burgundy/15 bg-white/60 p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-brown">
                    {detail.orderNumber}
                  </h2>
                  <p className="text-sm text-muted">
                    {new Date(detail.createdAt).toLocaleString("en-PK")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-burgundy/10 px-3 py-1 text-sm font-medium text-burgundy">
                    {ORDER_STATUS_LABELS[detail.status]}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
                      detail.paymentStatus === "paid"
                        ? "bg-green/15 text-green"
                        : detail.paymentStatus === "failed"
                          ? "bg-burgundy/15 text-burgundy"
                          : "bg-orange/15 text-orange"
                    }`}
                  >
                    Payment: {detail.paymentStatus || "pending"}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-burgundy/10 bg-cream/40 p-4">
                  <h3 className="text-sm font-semibold text-brown">Customer</h3>
                  <p className="mt-1 text-sm font-medium">{detail.customer.fullName}</p>
                  <p className="text-sm text-muted">{formatPhone(detail.customer.phone)}</p>
                  {detail.customer.alternatePhone && (
                    <p className="text-sm text-muted">
                      Alt: {formatPhone(detail.customer.alternatePhone)}
                    </p>
                  )}
                  {detail.customer.email && (
                    <p className="text-sm text-muted">{detail.customer.email}</p>
                  )}
                  {waPhone && (
                    <a
                      href={`https://wa.me/${waPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-burgundy hover:underline"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp customer
                    </a>
                  )}
                </div>
                <div className="rounded-lg border border-burgundy/10 bg-cream/40 p-4">
                  <h3 className="text-sm font-semibold text-brown">Delivery</h3>
                  <p className="mt-1 text-sm">{detail.delivery.address}</p>
                  <p className="text-sm text-muted">
                    {detail.delivery.area}, {detail.delivery.city}
                  </p>
                  {detail.delivery.landmark && (
                    <p className="text-sm text-muted">Landmark: {detail.delivery.landmark}</p>
                  )}
                  {detail.delivery.instructions && (
                    <p className="mt-2 text-sm text-brown">
                      Instructions: {detail.delivery.instructions}
                    </p>
                  )}
                  {detail.delivery.preferredTime && (
                    <p className="text-sm text-muted">Preferred: {detail.delivery.preferredTime}</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-burgundy/10 bg-cream/40 p-4">
                <h3 className="text-sm font-semibold text-brown">Payment</h3>
                <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                  <p>
                    Method:{" "}
                    <span className="font-medium uppercase">{detail.paymentMethod}</span>
                  </p>
                  <p>
                    Status:{" "}
                    <span className="font-medium capitalize">
                      {detail.paymentStatus || "pending"}
                    </span>
                  </p>
                  {detail.paymentTransactionId && (
                    <p className="sm:col-span-2">
                      Transaction / TID:{" "}
                      <span className="font-mono font-medium">{detail.paymentTransactionId}</span>
                    </p>
                  )}
                  {detail.couponCode && (
                    <p>
                      Coupon: <span className="font-medium">{detail.couponCode}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-brown">Items</h3>
                <div className="space-y-3">
                  {detail.items.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-burgundy/10 bg-white/80 px-3 py-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-brown">
                            {item.quantity}× {item.name}
                            {item.variant && (
                              <span className="font-normal text-muted">
                                {" "}
                                ({item.variant.name})
                              </span>
                            )}
                          </p>
                          {item.options && item.options.length > 0 && (
                            <p className="mt-1 text-xs text-muted">
                              {item.options
                                .map((o) => `${o.optionName}: ${o.choice}`)
                                .join(" · ")}
                            </p>
                          )}
                          {item.addons && item.addons.length > 0 && (
                            <p className="mt-1 text-xs text-muted">
                              Add-ons:{" "}
                              {item.addons
                                .map(
                                  (a) =>
                                    `${a.name}${a.size ? ` (${a.size})` : ""} ×${a.quantity}`
                                )
                                .join(", ")}
                            </p>
                          )}
                          {item.specialInstructions && (
                            <p className="mt-1 text-xs text-burgundy">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-medium">{formatPKR(item.lineTotal)}</p>
                          <p className="text-xs text-muted">
                            @ {formatPKR(item.unitPrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1 border-t border-burgundy/10 pt-3 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPKR(detail.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>{formatPKR(detail.deliveryFee)}</span>
                  </div>
                  {detail.discount > 0 && (
                    <div className="flex justify-between text-green">
                      <span>Discount</span>
                      <span>-{formatPKR(detail.discount)}</span>
                    </div>
                  )}
                  {detail.tax > 0 && (
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatPKR(detail.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-brown">
                    <span>Total</span>
                    <span>{formatPKR(detail.total)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-burgundy/10 bg-cream/50 p-4">
                <h3 className="text-sm font-semibold text-brown">Update Status</h3>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className={inputClass}
                >
                  {[...ORDER_STATUS_FLOW, "cancelled" as OrderStatus].map((s) => (
                    <option key={s} value={s}>
                      {ORDER_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <input
                  className={inputClass}
                  placeholder="Status note (optional)"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
                <textarea
                  className={inputClass}
                  rows={2}
                  placeholder="Internal notes"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                />
                <Button variant="secondary" size="sm" onClick={handleUpdate} loading={updating}>
                  Save Changes
                </Button>
              </div>

              {detail.statusHistory.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-brown">Status History</h3>
                  <ul className="space-y-1 text-xs text-muted">
                    {detail.statusHistory.map((h, i) => (
                      <li key={i}>
                        {ORDER_STATUS_LABELS[h.status]} —{" "}
                        {new Date(h.changedAt).toLocaleString("en-PK")}
                        {h.changedBy && ` · ${h.changedBy}`}
                        {h.note && ` (${h.note})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
