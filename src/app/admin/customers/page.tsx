"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { adminFetch } from "@/components/admin/AdminProviders";
import { formatPKR, formatPhone } from "@/lib/utils/format";

interface Customer {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);
      adminFetch<{ customers: Customer[] }>(`/api/customers?${params}`)
        .then((res) => {
          if (res.data) setCustomers(res.data.customers);
        })
        .finally(() => setLoading(false));
    }, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brown">Customers</h1>
        <p className="text-sm text-muted">View customer order history</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or email..."
          className="w-full rounded-lg border border-burgundy/20 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-burgundy/5" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-burgundy/30 py-16 text-center text-muted">
          No customers found
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-burgundy/15 bg-white/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-burgundy/10 bg-burgundy/5 text-left text-muted">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Total Spent</th>
                <th className="px-4 py-3 font-medium">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id} className="border-b border-burgundy/5">
                  <td className="px-4 py-3">
                    <p className="font-medium text-brown">{customer.fullName}</p>
                    {customer.email && <p className="text-xs text-muted">{customer.email}</p>}
                  </td>
                  <td className="px-4 py-3">{formatPhone(customer.phone)}</td>
                  <td className="px-4 py-3">{customer.totalOrders}</td>
                  <td className="px-4 py-3 font-medium">{formatPKR(customer.totalSpent)}</td>
                  <td className="px-4 py-3 text-muted">
                    {customer.lastOrderAt
                      ? new Date(customer.lastOrderAt).toLocaleDateString("en-PK")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
