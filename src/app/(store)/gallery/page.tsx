import Image from "next/image";
import { connectDB } from "@/lib/db/connect";
import { GalleryImage, GalleryCategory } from "@/models";
import { PageHero } from "@/components/ui/PageHero";
import { getPageFields } from "@/lib/cms/get-page";
import { FALLBACK_GALLERY } from "@/lib/data/fallback";
import { resolveMediaUrl } from "@/lib/uploads/types";

export const metadata = {
  title: "Gallery",
  description: "Photos from the Yummilicious kitchen — breakfasts, rolls, shawarma & more.",
};

export default async function GalleryPage() {
  const hero = await getPageFields("gallery", "hero");
  let categories: { name: string; slug: string }[] = [];
  let images: { _id: string; title: string; alt: string; url: string; category: string }[] = [];

  try {
    await connectDB();
    const [cats, imgs] = await Promise.all([
      GalleryCategory.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
      GalleryImage.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
    ]);
    categories = cats.map((c) => ({ name: c.name, slug: c.slug }));
    images = imgs.map((i) => ({
      _id: String(i._id),
      title: i.title,
      alt: i.alt,
      url: i.url,
      category: i.category,
    }));
  } catch {
    /* fallback */
  }

  if (!images.length && FALLBACK_GALLERY?.length) {
    images = FALLBACK_GALLERY.map((g, idx) => ({
      _id: `fb-${idx}`,
      title: g.title,
      alt: g.alt,
      url: g.url,
      category: g.category,
    }));
    const slugs = [...new Set(images.map((i) => i.category))];
    categories = slugs.map((slug) => ({
      name: slug.replace(/-/g, " "),
      slug,
    }));
  }

  return (
    <div>
      <PageHero
        eyebrow={hero.eyebrow}
        headline={hero.headline || "Gallery"}
        subcopy={hero.subcopy}
        image={hero.image}
      />
      <section className="bg-surface py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          {categories.map((cat) => {
            const catImages = images.filter((i) => i.category === cat.slug);
            if (!catImages.length) return null;
            return (
              <div key={cat.slug} className="mb-14">
                <h2 className="font-display mb-6 text-2xl font-bold capitalize text-burgundy">
                  {cat.name}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {catImages.map((img) => (
                    <div
                      key={img._id}
                      className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream shadow-warm"
                    >
                      <Image
                        src={resolveMediaUrl(img.url, "/images/hero/hero-bg.png")}
                        alt={img.alt || img.title}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 100vw, 33vw"
                        unoptimized={img.url.startsWith("/api/uploads/")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {!images.length && (
            <p className="text-center text-muted">Gallery images coming soon.</p>
          )}
        </div>
      </section>
    </div>
  );
}
