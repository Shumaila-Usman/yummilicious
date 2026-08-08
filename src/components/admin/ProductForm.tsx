"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { DietaryTag, IProductOption, IVariant, ISaleConfig, IInventory } from "@/types";
import { cn } from "@/lib/utils/cn";

export interface ProductFormData {
  name: string;
  shortDescription: string;
  fullDescription: string;
  basePrice: number;
  categories: string[];
  variants: IVariant[];
  options: IProductOption[];
  addonIds: string[];
  images: { url: string; alt?: string; publicId?: string; order: number }[];
  featuredImage: string;
  ingredients: string[];
  dietaryTags: DietaryTag[];
  includes: string[];
  isFeatured: boolean;
  isAvailable: boolean;
  isSoldOut: boolean;
  inventory: IInventory;
  preparationTime?: number;
  sale: ISaleConfig;
  displayOrder: number;
  seoTitle: string;
  seoDescription: string;
}

export const emptyProductForm = (): ProductFormData => ({
  name: "",
  shortDescription: "",
  fullDescription: "",
  basePrice: 0,
  categories: [],
  variants: [],
  options: [],
  addonIds: [],
  images: [],
  featuredImage: "",
  ingredients: [],
  dietaryTags: [],
  includes: [],
  isFeatured: false,
  isAvailable: true,
  isSoldOut: false,
  inventory: { track: false, quantity: 0, lowStockThreshold: 5 },
  preparationTime: undefined,
  sale: { enabled: false, type: "percentage", value: 0, startDate: null, endDate: null, showBadge: true },
  displayOrder: 0,
  seoTitle: "",
  seoDescription: "",
});

const DIETARY_OPTIONS: DietaryTag[] = ["vegetarian", "non-vegetarian", "spicy", "contains-egg"];

interface ProductFormProps {
  initial: ProductFormData;
  categories: { _id: string; name: string }[];
  addons: { _id: string; name: string; price: number }[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 block text-sm font-medium text-brown">
      {children}
      {required && <span className="text-burgundy"> *</span>}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm text-brown placeholder:text-brown/40 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20",
        props.className
      )}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm text-brown placeholder:text-brown/40 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20",
        props.className
      )}
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-burgundy/30 text-burgundy focus:ring-burgundy"
      />
      <span className="text-sm text-brown">{label}</span>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-burgundy/15 bg-white/50 p-5">
      <h3 className="font-display mb-4 text-lg font-semibold text-brown">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function ProductForm({
  initial,
  categories,
  addons,
  onSubmit,
  submitLabel = "Save Product",
  loading,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(initial);
  const [ingredientInput, setIngredientInput] = useState("");
  const [includeInput, setIncludeInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [tab, setTab] = useState<"listing" | "detail">("listing");

  const update = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const toggleCategory = (id: string) => {
    update(
      "categories",
      form.categories.includes(id)
        ? form.categories.filter((c) => c !== id)
        : [...form.categories, id]
    );
  };

  const toggleAddon = (id: string) => {
    update(
      "addonIds",
      form.addonIds.includes(id) ? form.addonIds.filter((a) => a !== id) : [...form.addonIds, id]
    );
  };

  const toggleDietary = (tag: DietaryTag) => {
    update(
      "dietaryTags",
      form.dietaryTags.includes(tag)
        ? form.dietaryTags.filter((t) => t !== tag)
        : [...form.dietaryTags, tag]
    );
  };

  const addVariant = () => {
    update("variants", [
      ...form.variants,
      { name: "", price: form.basePrice, isDefault: form.variants.length === 0, isAvailable: true },
    ]);
  };

  const updateVariant = (index: number, patch: Partial<IVariant>) => {
    const next = [...form.variants];
    next[index] = { ...next[index], ...patch };
    update("variants", next);
  };

  const removeVariant = (index: number) => {
    update("variants", form.variants.filter((_, i) => i !== index));
  };

  const addOption = () => {
    update("options", [
      ...form.options,
      { name: "", required: false, type: "single", choices: [{ label: "", priceModifier: 0 }] },
    ]);
  };

  const updateOption = (index: number, patch: Partial<IProductOption>) => {
    const next = [...form.options];
    next[index] = { ...next[index], ...patch };
    update("options", next);
  };

  const removeOption = (index: number) => {
    update("options", form.options.filter((_, i) => i !== index));
  };

  const addChoice = (optionIndex: number) => {
    const next = [...form.options];
    next[optionIndex].choices = [...next[optionIndex].choices, { label: "", priceModifier: 0 }];
    update("options", next);
  };

  const updateChoice = (
    optionIndex: number,
    choiceIndex: number,
    patch: { label?: string; priceModifier?: number }
  ) => {
    const next = [...form.options];
    next[optionIndex].choices[choiceIndex] = { ...next[optionIndex].choices[choiceIndex], ...patch };
    update("options", next);
  };

  const removeChoice = (optionIndex: number, choiceIndex: number) => {
    const next = [...form.options];
    next[optionIndex].choices = next[optionIndex].choices.filter((_, i) => i !== choiceIndex);
    update("options", next);
  };

  const addImage = () => {
    if (!imageUrlInput.trim()) return;
    update("images", [
      ...form.images,
      { url: imageUrlInput.trim(), alt: form.name, order: form.images.length },
    ]);
    if (!form.featuredImage) update("featuredImage", imageUrlInput.trim());
    setImageUrlInput("");
  };

  const removeImage = (index: number) => {
    const removed = form.images[index];
    const next = form.images.filter((_, i) => i !== index);
    update("images", next);
    if (form.featuredImage === removed.url) {
      update("featuredImage", next[0]?.url ?? "");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-2 rounded-xl border border-burgundy/15 bg-cream p-1">
        <button
          type="button"
          onClick={() => setTab("listing")}
          className={cn(
            "flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition",
            tab === "listing" ? "bg-burgundy text-cream" : "text-brown hover:bg-burgundy/10"
          )}
        >
          Listing / Card
        </button>
        <button
          type="button"
          onClick={() => setTab("detail")}
          className={cn(
            "flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition",
            tab === "detail" ? "bg-burgundy text-cream" : "text-brown hover:bg-burgundy/10"
          )}
        >
          Detail page
        </button>
      </div>

      {tab === "listing" && (
      <Section title="Menu listing (card)">
        <p className="text-xs text-muted">
          These fields update the main Menu page product cards.
        </p>
        <div>
          <FieldLabel required>Name</FieldLabel>
          <TextInput value={form.name} onChange={(e) => update("name", e.target.value)} required />
        </div>
        <div>
          <FieldLabel required>Short Description</FieldLabel>
          <TextArea
            value={form.shortDescription}
            onChange={(e) => update("shortDescription", e.target.value)}
            rows={2}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel required>Base Price (PKR)</FieldLabel>
            <TextInput
              type="number"
              min={0}
              value={form.basePrice}
              onChange={(e) => update("basePrice", Number(e.target.value))}
              required
            />
          </div>
          <div>
            <FieldLabel>Display Order</FieldLabel>
            <TextInput
              type="number"
              value={form.displayOrder}
              onChange={(e) => update("displayOrder", Number(e.target.value))}
            />
          </div>
        </div>
        <ImageUploadField
          label="Main / card image"
          value={form.featuredImage}
          folder="products"
          onChange={(url) => {
            update("featuredImage", url);
            if (url && !form.images.some((i) => i.url === url)) {
              update("images", [{ url, alt: form.name, order: 0 }, ...form.images]);
            }
          }}
        />
      </Section>
      )}

      {tab === "detail" && (
      <>
      <Section title="Detail page content">
        <div>
          <FieldLabel required>Full Description</FieldLabel>
          <TextArea
            value={form.fullDescription}
            onChange={(e) => update("fullDescription", e.target.value)}
            rows={5}
            required
          />
        </div>
        <div>
          <FieldLabel>Prep Time (minutes)</FieldLabel>
          <TextInput
            type="number"
            min={0}
            value={form.preparationTime ?? ""}
            onChange={(e) =>
              update("preparationTime", e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>
      </Section>

      <Section title="Categories">
        {categories.length === 0 ? (
          <p className="text-sm text-muted">No categories yet. Create categories first.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => toggleCategory(cat._id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  form.categories.includes(cat._id)
                    ? "border-burgundy bg-burgundy text-cream"
                    : "border-burgundy/30 bg-white text-brown hover:border-burgundy"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </Section>

      <Section title="Variants">
        {form.variants.map((variant, i) => (
          <div key={i} className="flex flex-wrap items-end gap-3 rounded-lg border border-burgundy/10 bg-white p-3">
            <div className="min-w-[120px] flex-1">
              <FieldLabel>Name</FieldLabel>
              <TextInput
                value={variant.name}
                onChange={(e) => updateVariant(i, { name: e.target.value })}
                placeholder="Regular, Large..."
              />
            </div>
            <div className="w-28">
              <FieldLabel>Price</FieldLabel>
              <TextInput
                type="number"
                min={0}
                value={variant.price}
                onChange={(e) => updateVariant(i, { price: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-2 pb-1">
              <Toggle
                label="Default"
                checked={!!variant.isDefault}
                onChange={(v) => updateVariant(i, { isDefault: v })}
              />
              <Toggle
                label="Available"
                checked={variant.isAvailable !== false}
                onChange={(v) => updateVariant(i, { isAvailable: v })}
              />
            </div>
            <button type="button" onClick={() => removeVariant(i)} className="p-2 text-burgundy hover:bg-burgundy/10 rounded-lg">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addVariant}>
          <Plus className="h-4 w-4" /> Add Variant
        </Button>
      </Section>

      <Section title="Options">
        {form.options.map((option, oi) => (
          <div key={oi} className="rounded-lg border border-burgundy/10 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-end gap-3">
              <div className="min-w-[140px] flex-1">
                <FieldLabel>Option Name</FieldLabel>
                <TextInput
                  value={option.name}
                  onChange={(e) => updateOption(oi, { name: e.target.value })}
                  placeholder="Size, Spice level..."
                />
              </div>
              <div>
                <FieldLabel>Type</FieldLabel>
                <select
                  value={option.type}
                  onChange={(e) => updateOption(oi, { type: e.target.value as "single" | "multiple" })}
                  className="rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm"
                >
                  <option value="single">Single</option>
                  <option value="multiple">Multiple</option>
                </select>
              </div>
              <Toggle
                label="Required"
                checked={option.required}
                onChange={(v) => updateOption(oi, { required: v })}
              />
              <button type="button" onClick={() => removeOption(oi)} className="p-2 text-burgundy">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 pl-2">
              {option.choices.map((choice, ci) => (
                <div key={ci} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-brown/30" />
                  <TextInput
                    value={choice.label}
                    onChange={(e) => updateChoice(oi, ci, { label: e.target.value })}
                    placeholder="Choice label"
                    className="flex-1"
                  />
                  <TextInput
                    type="number"
                    value={choice.priceModifier ?? 0}
                    onChange={(e) => updateChoice(oi, ci, { priceModifier: Number(e.target.value) })}
                    className="w-24"
                    placeholder="+/- PKR"
                  />
                  <button type="button" onClick={() => removeChoice(oi, ci)} className="p-1 text-burgundy">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => addChoice(oi)}>
                <Plus className="h-3 w-3" /> Add Choice
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          <Plus className="h-4 w-4" /> Add Option
        </Button>
      </Section>

      <Section title="Add-ons">
        {addons.length === 0 ? (
          <p className="text-sm text-muted">No add-ons available.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {addons.map((addon) => (
              <button
                key={addon._id}
                type="button"
                onClick={() => toggleAddon(addon._id)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm transition-colors",
                  form.addonIds.includes(addon._id)
                    ? "border-burgundy bg-burgundy text-cream"
                    : "border-burgundy/30 bg-white text-brown"
                )}
              >
                {addon.name} (PKR {addon.price})
              </button>
            ))}
          </div>
        )}
      </Section>

      <Section title="Images">
        <div className="flex gap-2">
          <TextInput
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="Image URL"
            className="flex-1"
          />
          <Button type="button" variant="secondary" size="sm" onClick={addImage}>
            Add
          </Button>
        </div>
        {form.images.length > 0 && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative rounded-lg border border-burgundy/15 bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt ?? ""} className="h-24 w-full rounded object-cover" />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="featuredImage"
                      checked={form.featuredImage === img.url}
                      onChange={() => update("featuredImage", img.url)}
                    />
                    Featured
                  </label>
                  <button type="button" onClick={() => removeImage(i)} className="text-burgundy">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Ingredients & Dietary">
        <div className="flex gap-2">
          <TextInput
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            placeholder="Add ingredient"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (ingredientInput.trim()) {
                  update("ingredients", [...form.ingredients, ingredientInput.trim()]);
                  setIngredientInput("");
                }
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (ingredientInput.trim()) {
                update("ingredients", [...form.ingredients, ingredientInput.trim()]);
                setIngredientInput("");
              }
            }}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.ingredients.map((ing, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-burgundy/10 px-3 py-1 text-sm">
              {ing}
              <button type="button" onClick={() => update("ingredients", form.ingredients.filter((_, j) => j !== i))}>
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          {DIETARY_OPTIONS.map((tag) => (
            <Toggle key={tag} label={tag} checked={form.dietaryTags.includes(tag)} onChange={() => toggleDietary(tag)} />
          ))}
        </div>
      </Section>

      <Section title="Deal Includes">
        <div className="flex gap-2">
          <TextInput
            value={includeInput}
            onChange={(e) => setIncludeInput(e.target.value)}
            placeholder="e.g. 1 Paratha Roll + Fries"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (includeInput.trim()) {
                update("includes", [...form.includes, includeInput.trim()]);
                setIncludeInput("");
              }
            }}
          >
            Add
          </Button>
        </div>
        <ul className="list-inside list-disc text-sm text-brown">
          {form.includes.map((item, i) => (
            <li key={i} className="flex items-center justify-between">
              {item}
              <button type="button" onClick={() => update("includes", form.includes.filter((_, j) => j !== i))} className="text-burgundy">
                Remove
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Status & Inventory">
        <div className="flex flex-wrap gap-6">
          <Toggle label="Featured" checked={form.isFeatured} onChange={(v) => update("isFeatured", v)} />
          <Toggle label="Available" checked={form.isAvailable} onChange={(v) => update("isAvailable", v)} />
          <Toggle label="Sold Out" checked={form.isSoldOut} onChange={(v) => update("isSoldOut", v)} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Toggle
            label="Track Inventory"
            checked={form.inventory.track}
            onChange={(v) => update("inventory", { ...form.inventory, track: v })}
          />
          <div>
            <FieldLabel>Quantity</FieldLabel>
            <TextInput
              type="number"
              min={0}
              value={form.inventory.quantity}
              onChange={(e) =>
                update("inventory", { ...form.inventory, quantity: Number(e.target.value) })
              }
              disabled={!form.inventory.track}
            />
          </div>
          <div>
            <FieldLabel>Low Stock Threshold</FieldLabel>
            <TextInput
              type="number"
              min={0}
              value={form.inventory.lowStockThreshold}
              onChange={(e) =>
                update("inventory", { ...form.inventory, lowStockThreshold: Number(e.target.value) })
              }
              disabled={!form.inventory.track}
            />
          </div>
        </div>
      </Section>

      <Section title="Sale Configuration">
        <Toggle
          label="Sale Enabled"
          checked={form.sale.enabled}
          onChange={(v) => update("sale", { ...form.sale, enabled: v })}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <FieldLabel>Type</FieldLabel>
            <select
              value={form.sale.type}
              onChange={(e) =>
                update("sale", { ...form.sale, type: e.target.value as ISaleConfig["type"] })
              }
              className="w-full rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
              <option value="sale_price">Sale Price</option>
            </select>
          </div>
          <div>
            <FieldLabel>Value</FieldLabel>
            <TextInput
              type="number"
              min={0}
              value={form.sale.value}
              onChange={(e) => update("sale", { ...form.sale, value: Number(e.target.value) })}
            />
          </div>
          <div>
            <FieldLabel>Start Date</FieldLabel>
            <TextInput
              type="datetime-local"
              value={form.sale.startDate ? String(form.sale.startDate).slice(0, 16) : ""}
              onChange={(e) =>
                update("sale", { ...form.sale, startDate: e.target.value || null })
              }
            />
          </div>
          <div>
            <FieldLabel>End Date</FieldLabel>
            <TextInput
              type="datetime-local"
              value={form.sale.endDate ? String(form.sale.endDate).slice(0, 16) : ""}
              onChange={(e) =>
                update("sale", { ...form.sale, endDate: e.target.value || null })
              }
            />
          </div>
        </div>
        <Toggle
          label="Show Sale Badge"
          checked={form.sale.showBadge !== false}
          onChange={(v) => update("sale", { ...form.sale, showBadge: v })}
        />
      </Section>

      <Section title="SEO">
        <div>
          <FieldLabel>SEO Title</FieldLabel>
          <TextInput value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} />
        </div>
        <div>
          <FieldLabel>SEO Description</FieldLabel>
          <TextArea
            value={form.seoDescription}
            onChange={(e) => update("seoDescription", e.target.value)}
            rows={2}
          />
        </div>
      </Section>
      </>
      )}

      <div className="flex justify-end gap-3 pb-8">
        <Button type="submit" variant="secondary" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
