import { connectDB } from "@/lib/db/connect";
import { Testimonial } from "@/models";
import { PageHero } from "@/components/ui/PageHero";
import { getPageFields } from "@/lib/cms/get-page";
import { TestimonialsSlider } from "@/components/store/TestimonialsSlider";
import { FALLBACK_REVIEWS } from "@/lib/data/fallback";

export const metadata = {
  title: "Testimonials",
  description: "What customers say about Yummilicious homemade food in Islamabad.",
};

export default async function TestimonialsPage() {
  const hero = await getPageFields("testimonials", "hero");
  let items: {
    _id: string;
    name: string;
    quote: string;
    role?: string;
    photo?: string;
    rating: number;
  }[] = [];

  try {
    await connectDB();
    const docs = await Testimonial.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();
    items = docs.map((d) => ({
      _id: String(d._id),
      name: d.name,
      quote: d.quote,
      role: d.role,
      photo: d.photo,
      rating: d.rating ?? 5,
    }));
  } catch {
    /* ignore */
  }

  if (!items.length) {
    items = FALLBACK_REVIEWS.map((r, i) => ({
      _id: `r-${i}`,
      name: r.name,
      quote: r.comment,
      rating: r.rating,
    }));
  }

  return (
    <div>
      <PageHero
        eyebrow={hero.eyebrow}
        headline={hero.headline || "What People Say"}
        subcopy={hero.subcopy}
        image={hero.image}
      />
      <section className="bg-surface py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 lg:px-6">
          <TestimonialsSlider items={items} />
        </div>
      </section>
    </div>
  );
}
