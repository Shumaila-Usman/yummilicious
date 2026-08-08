"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/AdminProviders";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";

type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "image";
  value: string;
};

type Section = {
  key: string;
  title: string;
  fields: Field[];
};

type PageDoc = {
  slug: string;
  title: string;
  sections: Section[];
};

export default function AdminPageEditor() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [page, setPage] = useState<PageDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch<PageDoc>(`/api/pages?slug=${slug}`)
      .then((res) => {
        if (res.data) setPage(res.data);
        else toast.error(res.error || "Failed to load page");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const updateField = (sectionKey: string, fieldKey: string, value: string) => {
    setPage((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((sec) =>
          sec.key !== sectionKey
            ? sec
            : {
                ...sec,
                fields: sec.fields.map((f) =>
                  f.key === fieldKey ? { ...f, value } : f
                ),
              }
        ),
      };
    });
  };

  const save = async () => {
    if (!page) return;
    setSaving(true);
    try {
      const res = await adminFetch<PageDoc>("/api/pages", {
        method: "PUT",
        body: JSON.stringify({
          slug: page.slug,
          title: page.title,
          sections: page.sections,
        }),
      });
      if (res.error || !res.data) throw new Error(res.error || "Save failed");
      setPage(res.data);
      toast.success("Page saved — live on the site");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-burgundy/5" />;
  }

  if (!page) {
    return (
      <div className="space-y-4">
        <p className="text-burgundy">Page not found.</p>
        <Link href="/admin/pages" className="text-sm text-burgundy underline">
          Back to pages
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/pages"
            className="mb-2 inline-flex items-center gap-1 text-sm text-burgundy hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Pages
          </Link>
          <h1 className="font-display text-3xl font-bold text-brown">{page.title}</h1>
          <p className="text-sm text-muted">
            Edit each section. Changes appear on the live site after save.
          </p>
        </div>
        <Button onClick={save} loading={saving}>
          Save page
        </Button>
      </div>

      {page.sections.map((section) => (
        <section
          key={section.key}
          className="space-y-4 rounded-2xl border border-burgundy/10 bg-cream p-5 shadow-sm"
        >
          <h2 className="font-display text-xl font-bold text-burgundy">{section.title}</h2>
          {section.fields.map((field) => {
            if (field.type === "image") {
              return (
                <ImageUploadField
                  key={field.key}
                  label={field.label}
                  value={field.value}
                  folder="pages"
                  onChange={(url) => updateField(section.key, field.key, url)}
                />
              );
            }
            if (field.type === "textarea") {
              return (
                <div key={field.key}>
                  <label className="mb-1 block text-sm font-medium text-brown">
                    {field.label}
                  </label>
                  <textarea
                    rows={4}
                    value={field.value}
                    onChange={(e) =>
                      updateField(section.key, field.key, e.target.value)
                    }
                    className="w-full rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm"
                  />
                </div>
              );
            }
            return (
              <div key={field.key}>
                <label className="mb-1 block text-sm font-medium text-brown">
                  {field.label}
                </label>
                <input
                  value={field.value}
                  onChange={(e) =>
                    updateField(section.key, field.key, e.target.value)
                  }
                  className="w-full rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm"
                />
              </div>
            );
          })}
        </section>
      ))}

      <div className="flex justify-end">
        <Button onClick={save} loading={saving}>
          Save page
        </Button>
      </div>
    </div>
  );
}
