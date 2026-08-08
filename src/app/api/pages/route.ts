import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { PageContent } from "@/models/PageContent";
import {
  PAGE_LIST,
  mergePageWithDefaults,
  type PageSlug,
} from "@/lib/cms/default-pages";
import { ensureDefaultPages } from "@/lib/cms/get-page";
import { serialize, jsonValidationError } from "@/lib/api/helpers";

const SLUG_TO_PATH: Record<string, string> = {
  home: "/",
  about: "/about",
  menu: "/menu",
  gallery: "/gallery",
  testimonials: "/testimonials",
  faqs: "/faqs",
  contact: "/contact",
};

const NO_STORE = { "Cache-Control": "no-store, must-revalidate" };

const sectionSchema = z.object({
  key: z.string(),
  title: z.string(),
  fields: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      type: z.enum(["text", "textarea", "image"]),
      value: z.string(),
    })
  ),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    await ensureDefaultPages();
    const slug = request.nextUrl.searchParams.get("slug") as PageSlug | null;

    if (slug) {
      if (!PAGE_LIST.some((p) => p.slug === slug)) {
        return NextResponse.json({ error: "Unknown page" }, { status: 404 });
      }
      const doc = await PageContent.findOne({ slug }).lean();
      return NextResponse.json(serialize(mergePageWithDefaults(slug, doc)), {
        headers: NO_STORE,
      });
    }

    const docs = await PageContent.find().lean();
    const pages = PAGE_LIST.map((meta) => {
      const doc = docs.find((d) => d.slug === meta.slug);
      return {
        ...meta,
        updatedAt: doc?.updatedAt ?? null,
        sectionCount: mergePageWithDefaults(meta.slug, doc).sections.length,
      };
    });

    return NextResponse.json({ pages }, { headers: NO_STORE });
  } catch (error) {
    console.error("GET /api/pages:", error);
    return NextResponse.json({ error: "Failed to load pages" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = z
      .object({
        slug: z.string(),
        title: z.string().optional(),
        sections: z.array(sectionSchema),
      })
      .safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const slug = parsed.data.slug as PageSlug;
    if (!PAGE_LIST.some((p) => p.slug === slug)) {
      return NextResponse.json({ error: "Unknown page" }, { status: 400 });
    }

    await connectDB();
    const page = await PageContent.findOneAndUpdate(
      { slug },
      {
        slug,
        title: parsed.data.title || PAGE_LIST.find((p) => p.slug === slug)?.title,
        sections: parsed.data.sections,
      },
      { upsert: true, new: true }
    ).lean();

    const path = SLUG_TO_PATH[slug] || "/";
    revalidatePath(path);
    revalidatePath("/", "layout");

    return NextResponse.json(serialize(mergePageWithDefaults(slug, page)));
  } catch (err) {
    console.error("PUT /api/pages:", err);
    return NextResponse.json({ error: "Failed to save page" }, { status: 500 });
  }
}
