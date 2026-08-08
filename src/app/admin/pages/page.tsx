"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { adminFetch } from "@/components/admin/AdminProviders";
import { toast } from "sonner";

type PageMeta = {
  slug: string;
  title: string;
  description: string;
  sectionCount: number;
  updatedAt: string | null;
};

export default function AdminPagesListPage() {
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch<{ pages: PageMeta[] }>("/api/pages")
      .then((res) => {
        if (res.data?.pages) setPages(res.data.pages);
        else if (res.error) toast.error(res.error);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brown">Pages</h1>
        <p className="text-sm text-muted">
          Edit every marketing page section-by-section, including images.
        </p>
      </div>

      <div className="grid gap-3">
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-burgundy/5" />
          ))}
        {!loading &&
          pages.map((page) => (
            <Link
              key={page.slug}
              href={`/admin/pages/${page.slug}`}
              className="flex items-center gap-4 rounded-2xl border border-burgundy/10 bg-cream px-5 py-4 shadow-sm transition hover:border-burgundy/30 hover:shadow-warm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-burgundy/10 text-burgundy">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold text-brown">{page.title}</p>
                <p className="text-sm text-muted">{page.description}</p>
                <p className="mt-1 text-xs text-muted">
                  {page.sectionCount} sections
                  {page.updatedAt
                    ? ` · Updated ${new Date(page.updatedAt).toLocaleString()}`
                    : " · Using defaults"}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-burgundy/50" />
            </Link>
          ))}
      </div>
    </div>
  );
}
