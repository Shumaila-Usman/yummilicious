"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/AdminProviders";
import { Button } from "@/components/ui/Button";
import type { StoreHoursShift } from "@/types";

interface SettingsForm {
  brandName: string;
  tagline: string;
  supportingLine: string;
  logo: string;
  favicon: string;
  currency: string;
  deliveryFee: number;
  freeDeliveryMin?: number;
  minimumOrderValue: number;
  taxEnabled: boolean;
  taxRate: number;
  whatsappNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
  };
  businessHours: StoreHoursShift[];
  storeOpen: boolean;
  estimatedPrepTime: number;
  deliveryAreas: string[];
  announcementBar: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  onlinePaymentEnabled: boolean;
  orderNotifications: {
    email: boolean;
    whatsapp: boolean;
  };
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
}

const inputClass =
  "w-full rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-burgundy/15 bg-white/60 p-5">
      <h2 className="font-display mb-4 text-lg font-semibold text-brown">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1 block text-sm font-medium text-brown">{children}</label>;
}

const defaultSettings = (): SettingsForm => ({
  brandName: "Yummilicious",
  tagline: "Homemade Comfort. Unforgettable Flavour.",
  supportingLine:
    "Freshly prepared homemade favourites, made with care and delivered with flavour.",
  logo: "/images/logo.svg",
  favicon: "/favicon.ico",
  currency: "PKR",
  deliveryFee: 150,
  minimumOrderValue: 300,
  taxEnabled: false,
  taxRate: 0,
  whatsappNumber: "923369863734",
  phone: "03369863734",
  email: "yummilicious321@gmail.com",
  address: "Islamabad, Pakistan",
  city: "Islamabad",
  socialLinks: {},
  businessHours: [
    { label: "Morning", start: "09:00", end: "12:00" },
    { label: "Evening", start: "20:00", end: "23:00" },
  ],
  storeOpen: true,
  estimatedPrepTime: 30,
  deliveryAreas: ["Islamabad"],
  announcementBar: {
    enabled: true,
    text: "Ordering windows: 9:00 AM – 12:00 PM & 8:00 PM – 11:00 PM",
  },
  onlinePaymentEnabled: false,
  orderNotifications: { email: true, whatsapp: true },
  seo: {
    title: "Yummilicious | Homemade Comfort. Unforgettable Flavour.",
    description:
      "Freshly prepared homemade favourites — breakfasts, shawarmas, paratha rolls and tea.",
  },
});

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(defaultSettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deliveryAreaInput, setDeliveryAreaInput] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminFetch<SettingsForm>("/api/settings")
      .then((res) => {
        if (cancelled || !res.data) return;
        setForm({
          ...defaultSettings(),
          ...res.data,
          businessHours: res.data.businessHours?.length
            ? res.data.businessHours
            : defaultSettings().businessHours,
          phone: res.data.phone || "03369863734",
          email: res.data.email || "yummilicious321@gmail.com",
          announcementBar:
            res.data.announcementBar ?? defaultSettings().announcementBar,
          orderNotifications:
            res.data.orderNotifications ?? defaultSettings().orderNotifications,
          seo: res.data.seo ?? defaultSettings().seo,
          socialLinks: res.data.socialLinks ?? {},
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateShift = (index: number, patch: Partial<StoreHoursShift>) => {
    setForm((prev) => {
      const next = [...prev.businessHours];
      next[index] = { ...next[index], ...patch };
      return { ...prev, businessHours: next };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await adminFetch("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Settings saved");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-burgundy/10" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-burgundy/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brown">Settings</h1>
          <p className="text-sm text-muted">Configure your store</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" /> Save All
        </Button>
      </div>

      <Section title="Brand">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Brand Name</Label>
            <input
              className={inputClass}
              value={form.brandName}
              onChange={(e) => update("brandName", e.target.value)}
            />
          </div>
          <div>
            <Label>Currency</Label>
            <input
              className={inputClass}
              value={form.currency}
              onChange={(e) => update("currency", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Tagline</Label>
            <input
              className={inputClass}
              value={form.tagline}
              onChange={(e) => update("tagline", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Supporting Line</Label>
            <textarea
              className={inputClass}
              rows={2}
              value={form.supportingLine}
              onChange={(e) => update("supportingLine", e.target.value)}
            />
          </div>
          <div>
            <Label>Logo URL</Label>
            <input
              className={inputClass}
              value={form.logo}
              onChange={(e) => update("logo", e.target.value)}
            />
          </div>
          <div>
            <Label>Favicon URL</Label>
            <input
              className={inputClass}
              value={form.favicon}
              onChange={(e) => update("favicon", e.target.value)}
            />
          </div>
        </div>
      </Section>

      <Section title="Contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Phone</Label>
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="03369863734"
            />
          </div>
          <div>
            <Label>WhatsApp Number</Label>
            <input
              className={inputClass}
              value={form.whatsappNumber}
              onChange={(e) => update("whatsappNumber", e.target.value)}
              placeholder="923369863734"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Email</Label>
            <input
              className={inputClass}
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="yummilicious321@gmail.com"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <input
              className={inputClass}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>
          <div>
            <Label>City</Label>
            <input
              className={inputClass}
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </div>
        </div>
      </Section>

      <Section title="Business Hours">
        <p className="text-sm text-muted">Configure your two daily ordering windows</p>
        {form.businessHours.map((shift, i) => (
          <div
            key={i}
            className="grid gap-3 rounded-lg border border-burgundy/10 bg-cream/50 p-4 sm:grid-cols-3"
          >
            <div>
              <Label>Shift Label</Label>
              <input
                className={inputClass}
                value={shift.label}
                onChange={(e) => updateShift(i, { label: e.target.value })}
              />
            </div>
            <div>
              <Label>Start</Label>
              <input
                className={inputClass}
                type="time"
                value={shift.start}
                onChange={(e) => updateShift(i, { start: e.target.value })}
              />
            </div>
            <div>
              <Label>End</Label>
              <input
                className={inputClass}
                type="time"
                value={shift.end}
                onChange={(e) => updateShift(i, { end: e.target.value })}
              />
            </div>
          </div>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.storeOpen}
            onChange={(e) => update("storeOpen", e.target.checked)}
            className="h-4 w-4 rounded text-burgundy"
          />
          Store is open for orders
        </label>
        <div>
          <Label>Estimated Prep Time (minutes)</Label>
          <input
            className={inputClass}
            type="number"
            value={form.estimatedPrepTime}
            onChange={(e) => update("estimatedPrepTime", Number(e.target.value))}
          />
        </div>
      </Section>

      <Section title="Delivery & Pricing">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Delivery Fee (PKR)</Label>
            <input
              className={inputClass}
              type="number"
              value={form.deliveryFee}
              onChange={(e) => update("deliveryFee", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Free Delivery Min (PKR)</Label>
            <input
              className={inputClass}
              type="number"
              value={form.freeDeliveryMin ?? ""}
              onChange={(e) =>
                update(
                  "freeDeliveryMin",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>
          <div>
            <Label>Minimum Order (PKR)</Label>
            <input
              className={inputClass}
              type="number"
              value={form.minimumOrderValue}
              onChange={(e) => update("minimumOrderValue", Number(e.target.value))}
            />
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.taxEnabled}
                onChange={(e) => update("taxEnabled", e.target.checked)}
                className="h-4 w-4 rounded text-burgundy"
              />
              Tax enabled
            </label>
            {form.taxEnabled && (
              <input
                className={`${inputClass} w-24`}
                type="number"
                step="0.01"
                value={form.taxRate}
                onChange={(e) => update("taxRate", Number(e.target.value))}
                placeholder="%"
              />
            )}
          </div>
        </div>
        <div>
          <Label>Delivery Areas</Label>
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={deliveryAreaInput}
              onChange={(e) => setDeliveryAreaInput(e.target.value)}
              placeholder="Add area"
              onKeyDown={(e) => {
                if (e.key === "Enter" && deliveryAreaInput.trim()) {
                  e.preventDefault();
                  update("deliveryAreas", [
                    ...form.deliveryAreas,
                    deliveryAreaInput.trim(),
                  ]);
                  setDeliveryAreaInput("");
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (deliveryAreaInput.trim()) {
                  update("deliveryAreas", [
                    ...form.deliveryAreas,
                    deliveryAreaInput.trim(),
                  ]);
                  setDeliveryAreaInput("");
                }
              }}
            >
              Add
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {form.deliveryAreas.map((area, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-burgundy/10 px-3 py-1 text-sm"
              >
                {area}
                <button
                  type="button"
                  onClick={() =>
                    update(
                      "deliveryAreas",
                      form.deliveryAreas.filter((_, j) => j !== i)
                    )
                  }
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Announcement Bar">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.announcementBar.enabled}
            onChange={(e) =>
              update("announcementBar", {
                ...form.announcementBar,
                enabled: e.target.checked,
              })
            }
            className="h-4 w-4 rounded text-burgundy"
          />
          Show announcement bar
        </label>
        <div>
          <Label>Text</Label>
          <input
            className={inputClass}
            value={form.announcementBar.text}
            onChange={(e) =>
              update("announcementBar", {
                ...form.announcementBar,
                text: e.target.value,
              })
            }
          />
        </div>
        <div>
          <Label>Link (optional)</Label>
          <input
            className={inputClass}
            value={form.announcementBar.link ?? ""}
            onChange={(e) =>
              update("announcementBar", {
                ...form.announcementBar,
                link: e.target.value || undefined,
              })
            }
          />
        </div>
      </Section>

      <Section title="Social Links">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["instagram", "facebook", "tiktok", "youtube"] as const).map(
            (platform) => (
              <div key={platform}>
                <Label>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Label>
                <input
                  className={inputClass}
                  value={form.socialLinks[platform] ?? ""}
                  onChange={(e) =>
                    update("socialLinks", {
                      ...form.socialLinks,
                      [platform]: e.target.value,
                    })
                  }
                />
              </div>
            )
          )}
        </div>
      </Section>

      <Section title="Payments & Notifications">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.onlinePaymentEnabled}
            onChange={(e) => update("onlinePaymentEnabled", e.target.checked)}
            className="h-4 w-4 rounded text-burgundy"
          />
          Online payment enabled
        </label>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.orderNotifications.email}
              onChange={(e) =>
                update("orderNotifications", {
                  ...form.orderNotifications,
                  email: e.target.checked,
                })
              }
              className="h-4 w-4 rounded text-burgundy"
            />
            Email notifications
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.orderNotifications.whatsapp}
              onChange={(e) =>
                update("orderNotifications", {
                  ...form.orderNotifications,
                  whatsapp: e.target.checked,
                })
              }
              className="h-4 w-4 rounded text-burgundy"
            />
            WhatsApp notifications
          </label>
        </div>
      </Section>

      <Section title="SEO">
        <div>
          <Label>Title</Label>
          <input
            className={inputClass}
            value={form.seo.title}
            onChange={(e) => update("seo", { ...form.seo, title: e.target.value })}
          />
        </div>
        <div>
          <Label>Description</Label>
          <textarea
            className={inputClass}
            rows={3}
            value={form.seo.description}
            onChange={(e) =>
              update("seo", { ...form.seo, description: e.target.value })
            }
          />
        </div>
        <div>
          <Label>OG Image URL</Label>
          <input
            className={inputClass}
            value={form.seo.ogImage ?? ""}
            onChange={(e) =>
              update("seo", {
                ...form.seo,
                ogImage: e.target.value || undefined,
              })
            }
          />
        </div>
      </Section>

      <div className="flex justify-end pb-8">
        <Button variant="secondary" onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" /> Save All Settings
        </Button>
      </div>
    </div>
  );
}
