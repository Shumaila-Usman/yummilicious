import Image from "next/image";
import { Heart, Users, Utensils } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { PageHero } from "@/components/ui/PageHero";
import { getPage, getSiteContact } from "@/lib/cms/get-page";
import { fieldMap } from "@/lib/cms/default-pages";
import { formatPhone } from "@/lib/utils/format";
import { resolveMediaUrl } from "@/lib/uploads/types";

export const metadata = {
  title: "About Us",
  description: "Learn about Yummilicious — homemade comfort food made with love in Islamabad.",
};

const VALUES = [
  {
    icon: Heart,
    title: "Passion",
    text: "Every dish is a labour of love, crafted with the same care we'd serve our own family.",
  },
  {
    icon: Utensils,
    title: "Freshness",
    text: "Limited ordering windows mean your food is always made fresh — never reheated.",
  },
  {
    icon: Users,
    title: "Community",
    text: "We're proud to be part of Islamabad's food culture, one happy customer at a time.",
  },
];

export default async function AboutPage() {
  const [page, contact] = await Promise.all([getPage("about"), getSiteContact()]);
  const hero = fieldMap(page.sections, "hero");
  const story = fieldMap(page.sections, "story");
  const values = fieldMap(page.sections, "values");
  const paragraphs = (story.body || "").split(/\n\n+/).filter(Boolean);

  return (
    <div>
      <PageHero
        eyebrow={hero.eyebrow}
        headline={hero.headline || "Homemade with Heart"}
        subcopy={hero.subcopy}
        image={hero.image}
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-6">
          <ScrollReveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-cream shadow-warm">
              <Image
                src={resolveMediaUrl(
                  story.image || "/images/home/kitchen.png",
                  "/images/home/kitchen.png"
                )}
                alt="Our kitchen"
                fill
                className="object-cover"
                sizes="50vw"
                priority
                unoptimized={(story.image || "").startsWith("/api/uploads/")}
              />
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.15}>
            <h2 className="font-display text-3xl font-bold text-burgundy">
              {story.headline || "How It Started"}
            </h2>
            <div className="mt-6 space-y-4 text-muted leading-relaxed">
              {paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-cream/50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-burgundy">
              {values.headline || "What We Stand For"}
            </h2>
            <p className="mt-3 text-muted">{values.subcopy}</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-burgundy/10 text-burgundy">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display mt-4 text-xl font-bold text-brown">{v.title}</h3>
                <p className="mt-2 text-sm text-muted">{v.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-sm text-muted">
            Reach us at {formatPhone(contact.phone)} · {contact.email}
          </p>
        </div>
      </section>
    </div>
  );
}
