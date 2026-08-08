"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Package,
  Users,
  Image,
  MessageSquareQuote,
  FileText,
  Settings,
  PlusCircle,
} from "lucide-react";
import { adminFetch } from "@/components/admin/AdminProviders";
import { StatCard } from "@/components/admin/StatCard";
import { formatPKR } from "@/lib/utils/format";
import { ORDER_STATUS_LABELS } from "@/types";
import type { OrderStatus } from "@/types";

interface DashboardData {
  stats: {
    totalOrders: number;
    todayOrders: number;
    pendingOrders: number;
    completedOrders: number;
    revenue: number;
    productCount?: number;
    categoryCount?: number;
    customerCount?: number;
    galleryCount?: number;
    testimonialCount?: number;
    faqCount?: number;
    storeOpen?: boolean;
  };
  salesChart: { date: string; orders: number; revenue: number }[];
  categoryPerformance: { name: string; revenue: number; quantity: number }[];
  bestSellers: { name: string; totalQuantity: number; revenue: number }[];
  recentOrders: {
    _id: string;
    orderNumber: string;
    customer: { fullName: string };
    status: OrderStatus;
    total: number;
    createdAt: string;
  }[];
  lowStock: { name: string; slug: string; inventory: { quantity: number } }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch<DashboardData>("/api/dashboard")
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData =
    data?.salesChart.map((d) => ({
      ...d,
      label: new Date(d.date).toLocaleDateString("en-PK", { month: "short", day: "numeric" }),
    })) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brown">Dashboard</h1>
          <p className="text-sm text-muted">
            Overview of your store ·{" "}
            <span className={data?.stats.storeOpen === false ? "text-burgundy" : "text-green"}>
              {data?.stats.storeOpen === false ? "Store closed" : "Store open"}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/pages/home"
            className="inline-flex items-center gap-1.5 rounded-full border border-burgundy/20 bg-cream px-3 py-1.5 text-xs font-semibold text-burgundy hover:bg-burgundy hover:text-cream"
          >
            <FileText className="h-3.5 w-3.5" /> Edit Home
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-full border border-burgundy/20 bg-cream px-3 py-1.5 text-xs font-semibold text-burgundy hover:bg-burgundy hover:text-cream"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Add Product
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 rounded-full border border-burgundy/20 bg-cream px-3 py-1.5 text-xs font-semibold text-burgundy hover:bg-burgundy hover:text-cream"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Orders
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1.5 rounded-full border border-burgundy/20 bg-cream px-3 py-1.5 text-xs font-semibold text-burgundy hover:bg-burgundy hover:text-cream"
          >
            <Settings className="h-3.5 w-3.5" /> Settings
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products" value={data?.stats.productCount ?? 0} icon={Package} loading={loading} />
        <StatCard label="Customers" value={data?.stats.customerCount ?? 0} icon={Users} loading={loading} />
        <StatCard label="Gallery" value={data?.stats.galleryCount ?? 0} icon={Image} loading={loading} />
        <StatCard
          label="Testimonials / FAQs"
          value={`${data?.stats.testimonialCount ?? 0} / ${data?.stats.faqCount ?? 0}`}
          icon={MessageSquareQuote}
          loading={loading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Orders" value={data?.stats.totalOrders ?? 0} icon={ShoppingBag} loading={loading} />
        <StatCard label="Today" value={data?.stats.todayOrders ?? 0} icon={TrendingUp} loading={loading} />
        <StatCard label="Pending" value={data?.stats.pendingOrders ?? 0} icon={Clock} loading={loading} />
        <StatCard label="Completed" value={data?.stats.completedOrders ?? 0} icon={CheckCircle} loading={loading} />
        <StatCard
          label="Revenue"
          value={loading ? "—" : formatPKR(data?.stats.revenue ?? 0)}
          icon={DollarSign}
          loading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-burgundy/15 bg-white/60 p-5">
          <h2 className="font-display mb-4 text-lg font-semibold text-brown">Sales (14 days)</h2>
          {loading ? (
            <div className="h-64 animate-pulse rounded-lg bg-burgundy/5" />
          ) : chartData.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">No sales data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9e0b18" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9e0b18" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#9e0b1820" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b4a3a" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6b4a3a" }} />
                <Tooltip
                  contentStyle={{ background: "#fff4da", border: "1px solid #9e0b1830", borderRadius: 8 }}
                  formatter={(value, name) => [
                    name === "revenue" ? formatPKR(Number(value)) : value,
                    name === "revenue" ? "Revenue" : "Orders",
                  ]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#9e0b18" fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-burgundy/15 bg-white/60 p-5">
          <h2 className="font-display mb-4 text-lg font-semibold text-brown">Orders by Day</h2>
          {loading ? (
            <div className="h-64 animate-pulse rounded-lg bg-burgundy/5" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#9e0b1820" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b4a3a" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6b4a3a" }} />
                <Tooltip contentStyle={{ background: "#fff4da", border: "1px solid #9e0b1830", borderRadius: 8 }} />
                <Bar dataKey="orders" fill="#f28c00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-burgundy/15 bg-white/60 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-brown">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-burgundy hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-burgundy/5" />
              ))}
            </div>
          ) : !data?.recentOrders.length ? (
            <p className="py-8 text-center text-sm text-muted">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-burgundy/10 text-left text-muted">
                    <th className="pb-2 font-medium">Order</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-burgundy/5">
                      <td className="py-2.5 font-medium text-brown">{order.orderNumber}</td>
                      <td className="py-2.5">{order.customer.fullName}</td>
                      <td className="py-2.5">
                        <span className="rounded-full bg-burgundy/10 px-2 py-0.5 text-xs font-medium text-burgundy">
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-medium">{formatPKR(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-burgundy/15 bg-white/60 p-5">
            <h2 className="font-display mb-3 text-lg font-semibold text-brown">Best Sellers</h2>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 animate-pulse rounded bg-burgundy/5" />
                ))}
              </div>
            ) : !data?.bestSellers.length ? (
              <p className="text-sm text-muted">No data</p>
            ) : (
              <ul className="space-y-2">
                {data.bestSellers.slice(0, 5).map((item, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="truncate text-brown">{item.name}</span>
                    <span className="shrink-0 text-muted">{item.totalQuantity} sold</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-burgundy/15 bg-white/60 p-5">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange" />
              <h2 className="font-display text-lg font-semibold text-brown">Low Stock</h2>
            </div>
            {loading ? (
              <div className="h-20 animate-pulse rounded bg-burgundy/5" />
            ) : !data?.lowStock.length ? (
              <p className="text-sm text-muted">All stocked up</p>
            ) : (
              <ul className="space-y-2">
                {data.lowStock.map((p) => (
                  <li key={p.slug} className="flex justify-between text-sm">
                    <span>{p.name}</span>
                    <span className="text-burgundy">{p.inventory.quantity} left</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
