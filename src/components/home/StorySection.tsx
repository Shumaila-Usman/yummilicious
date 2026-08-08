import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { resolveMediaUrl } from "@/lib/uploads/types";

export type StoryContent = {
  eyebrow?: string;
  headline?: string;
  body?: string;
  image?: string;
};

export function StorySection({ content }: { content?: StoryContent }) {
  const eyebrow = content?.eyebrow || "Our Story";
  const headline = content?.headline || "From Our Kitchen to Your Table";
  const body =
    content?.body ||
    "Yummilicious began with a simple belief: food should feel like home.\n\nWe're not a factory kitchen. We're a family of food lovers in Islamabad, crafting homemade comfort for busy mornings and hungry evenings.";
  const image = resolveMediaUrl(
    content?.image || "/images/home/kitchen.png",
    "/images/home/kitchen.png"
  );
  const paragraphs = body.split(/\n\n+/).filter(Boolean);

  return (
    <section className="overflow-hidden bg-surface py-14 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-6">
        <ScrollReveal direction="left">
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-burgundy/20 to-orange/20 blur-xl" />
            <div className="relative grid grid-cols-2 gap-3">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream">
                <Image
                  src={image}
                  alt="Our homemade kitchen"
                  fill
                  className="object-cover"
                  sizes="300px"
                  unoptimized={image.startsWith("/api/uploads/")}
                />
              </div>
              <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-2xl bg-cream">
                <Image
                  src="/images/home/making-food.png"
                  alt="Making food with care"
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={0.15}>
          <span className="font-script text-xl text-orange">{eyebrow}</span>
          <h2 className="font-display mt-2 text-3xl font-bold text-burgundy sm:text-4xl">
            {headline}
          </h2>
          <div className="mt-6 space-y-4 text-muted leading-relaxed">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <Link href="/about" className="mt-8 inline-block">
            <Button variant="secondary">Read Our Full Story</Button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
