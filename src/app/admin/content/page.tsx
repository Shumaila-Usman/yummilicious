"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/AdminProviders";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/Button";

interface ContentItem {
  _id: string;
  key: string;
  section: string;
  data: Record<string, unknown>;
}

interface GalleryImage {
  _id: string;
  title: string;
  alt: string;
  url: string;
  category?: string;
  displayOrder: number;
  isActive: boolean;
}

interface Review {
  name: string;
  rating: number;
  comment: string;
  date?: string;
}

const GALLERY_CATEGORIES = [
  "breakfast",
  "sandwiches",
  "rolls",
  "shawarma",
  "tea",
  "behind-the-scenes",
  "general",
] as const;

export default function AdminContentPage() {
  const [tab, setTab] = useState<"content" | "gallery" | "reviews">("content");
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [editSection, setEditSection] = useState("");
  const [editDataJson, setEditDataJson] = useState("{}");
  const [newKey, setNewKey] = useState("");
  const [newSection, setNewSection] = useState("");
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteGalleryId, setDeleteGalleryId] = useState<string | null>(null);
  const [newGallery, setNewGallery] = useState({
    title: "",
    alt: "",
    url: "",
    category: "general" as string,
    displayOrder: 0,
    isActive: true,
  });

  const loadContent = () =>
    adminFetch<{ content: ContentItem[] }>("/api/content").then((res) => {
      if (res.data) setContentItems(res.data.content);
    });

  const loadGallery = () =>
    adminFetch<{ images: GalleryImage[] }>("/api/gallery?admin=true&limit=100").then((res) => {
      if (res.data) setGallery(res.data.images);
    });

  const loadReviews = () =>
    adminFetch<{ reviews: Review[] }>("/api/settings").then((res) => {
      if (res.data?.reviews) setReviews(res.data.reviews);
    });

  useEffect(() => {
    setLoading(true);
    Promise.all([loadContent(), loadGallery(), loadReviews()]).finally(() => setLoading(false));
  }, []);

  const selectContent = (item: ContentItem) => {
    setSelectedKey(item.key);
    setEditSection(item.section);
    setEditDataJson(JSON.stringify(item.data, null, 2));
  };

  const saveContent = async () => {
    if (!selectedKey) return;
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(editDataJson);
    } catch {
      toast.error("Invalid JSON in data field");
      return;
    }
    setSaving(true);
    const res = await adminFetch("/api/content", {
      method: "PATCH",
      body: JSON.stringify({ key: selectedKey, section: editSection, data }),
    });
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Content saved");
    loadContent();
  };

  const createContent = async () => {
    if (!newKey.trim() || !newSection.trim()) {
      toast.error("Key and section are required");
      return;
    }
    setSaving(true);
    const res = await adminFetch("/api/content", {
      method: "POST",
      body: JSON.stringify({ key: newKey, section: newSection, data: {} }),
    });
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Content key created");
    setNewKey("");
    setNewSection("");
    loadContent();
  };

  const addGalleryImage = async () => {
    if (!newGallery.title || !newGallery.url) {
      toast.error("Title and URL are required");
      return;
    }
    setSaving(true);
    const res = await adminFetch("/api/gallery", {
      method: "POST",
      body: JSON.stringify({ ...newGallery, alt: newGallery.alt || newGallery.title }),
    });
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Gallery image added");
    setNewGallery({ title: "", alt: "", url: "", category: "general", displayOrder: 0, isActive: true });
    loadGallery();
  };

  const deleteGallery = async () => {
    if (!deleteGalleryId) return;
    setSaving(true);
    const res = await adminFetch(`/api/gallery/${deleteGalleryId}`, { method: "DELETE" });
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Image deleted");
    setDeleteGalleryId(null);
    loadGallery();
  };

  const saveReviews = async () => {
    setSaving(true);
    const res = await adminFetch("/api/settings", {
      method: "PATCH",
      body: JSON.stringify({ reviews }),
    });
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Reviews saved");
  };

  const addReview = () => {
    setReviews([...reviews, { name: "", rating: 5, comment: "", date: new Date().toISOString().slice(0, 10) }]);
  };

  const inputClass =
    "w-full rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20";

  const tabs = [
    { id: "content" as const, label: "Site Content" },
    { id: "gallery" as const, label: "Gallery" },
    { id: "reviews" as const, label: "Reviews" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brown">Content</h1>
        <p className="text-sm text-muted">Manage site content, gallery, and customer reviews</p>
      </div>

      <div className="flex gap-2 border-b border-burgundy/15">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-b-2 border-burgundy text-burgundy"
                : "text-muted hover:text-brown"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-xl bg-burgundy/5" />
      ) : tab === "content" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="rounded-xl border border-burgundy/15 bg-white/60 p-4">
              <h3 className="mb-3 font-semibold text-brown">Content Keys</h3>
              {contentItems.length === 0 ? (
                <p className="text-sm text-muted">No content keys yet</p>
              ) : (
                <ul className="space-y-1">
                  {contentItems.map((item) => (
                    <li key={item._id}>
                      <button
                        type="button"
                        onClick={() => selectContent(item)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                          selectedKey === item.key ? "bg-burgundy text-cream" : "hover:bg-burgundy/10"
                        }`}
                      >
                        <span className="font-medium">{item.key}</span>
                        <span className="block text-xs opacity-70">{item.section}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-xl border border-burgundy/15 bg-white/60 p-4">
              <h3 className="mb-3 font-semibold text-brown">New Key</h3>
              <div className="space-y-2">
                <input className={inputClass} placeholder="key" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
                <input className={inputClass} placeholder="section" value={newSection} onChange={(e) => setNewSection(e.target.value)} />
                <Button variant="outline" size="sm" onClick={createContent} loading={saving}>
                  <Plus className="h-4 w-4" /> Create
                </Button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            {selectedKey ? (
              <div className="rounded-xl border border-burgundy/15 bg-white/60 p-5 space-y-4">
                <h3 className="font-display text-lg font-semibold text-brown">{selectedKey}</h3>
                <div>
                  <label className="mb-1 block text-sm font-medium">Section</label>
                  <input className={inputClass} value={editSection} onChange={(e) => setEditSection(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Data (JSON)</label>
                  <textarea
                    className={`${inputClass} font-mono text-xs`}
                    rows={16}
                    value={editDataJson}
                    onChange={(e) => setEditDataJson(e.target.value)}
                  />
                </div>
                <Button variant="secondary" size="sm" onClick={saveContent} loading={saving}>
                  <Save className="h-4 w-4" /> Save Content
                </Button>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-burgundy/30 text-muted">
                Select a content key to edit
              </div>
            )}
          </div>
        </div>
      ) : tab === "gallery" ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-burgundy/15 bg-white/60 p-5">
            <h3 className="mb-4 font-semibold text-brown">Add Gallery Image</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <input className={inputClass} placeholder="Title" value={newGallery.title} onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })} />
              <input className={inputClass} placeholder="Image URL" value={newGallery.url} onChange={(e) => setNewGallery({ ...newGallery, url: e.target.value })} />
              <select className={inputClass} value={newGallery.category} onChange={(e) => setNewGallery({ ...newGallery, category: e.target.value })}>
                {GALLERY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <Button variant="secondary" size="sm" className="mt-3" onClick={addGalleryImage} loading={saving}>
              <Plus className="h-4 w-4" /> Add Image
            </Button>
          </div>
          {gallery.length === 0 ? (
            <div className="rounded-xl border border-dashed border-burgundy/30 py-16 text-center text-muted">No gallery images</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((img) => (
                <div key={img._id} className="rounded-xl border border-burgundy/15 bg-white/60 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt} className="h-40 w-full object-cover" />
                  <div className="p-3">
                    <p className="font-medium text-brown">{img.title}</p>
                    <p className="text-xs text-muted">{img.category}</p>
                    <button type="button" onClick={() => setDeleteGalleryId(img._id)} className="mt-2 text-sm text-burgundy hover:underline">
                      <Trash2 className="inline h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <div key={i} className="rounded-xl border border-burgundy/15 bg-white/60 p-4 grid gap-3 sm:grid-cols-2">
              <input className={inputClass} placeholder="Name" value={review.name} onChange={(e) => { const next = [...reviews]; next[i] = { ...review, name: e.target.value }; setReviews(next); }} />
              <input className={inputClass} type="number" min={1} max={5} placeholder="Rating" value={review.rating} onChange={(e) => { const next = [...reviews]; next[i] = { ...review, rating: Number(e.target.value) }; setReviews(next); }} />
              <textarea className={`${inputClass} sm:col-span-2`} rows={2} placeholder="Comment" value={review.comment} onChange={(e) => { const next = [...reviews]; next[i] = { ...review, comment: e.target.value }; setReviews(next); }} />
              <button type="button" onClick={() => setReviews(reviews.filter((_, j) => j !== i))} className="text-sm text-burgundy sm:col-span-2">
                Remove review
              </button>
            </div>
          ))}
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={addReview}>
              <Plus className="h-4 w-4" /> Add Review
            </Button>
            <Button variant="secondary" size="sm" onClick={saveReviews} loading={saving}>
              <Save className="h-4 w-4" /> Save Reviews
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteGalleryId}
        title="Delete Gallery Image"
        message="This will permanently remove this image from the gallery."
        onConfirm={deleteGallery}
        onCancel={() => setDeleteGalleryId(null)}
        loading={saving}
      />
    </div>
  );
}
