import Image from "next/image";
import { Heart, Users, Utensils } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { CONTACT } from "@/lib/data/fallback";
import { formatShiftDisplay } from "@/lib/utils/store-hours";

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

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-hero-gradient py-20 lg:py-28">
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center lg:px-6">
          <span className="font-script text-2xl text-gold">Our Story</span>
          <h1 className="font-display mt-3 text-3xl font-bold text-cream sm:text-5xl">
            Homemade with Heart
          </h1>
          <p className="mt-4 text-lg text-cream/80">
            Yummilicious was born from a kitchen, not a boardroom — with recipes passed down
            and flavours that feel like home.
          </p>
        </div>
        <div className="sauce-divider relative z-10 mt-12" aria-hidden />
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-6">
          <ScrollReveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-cream shadow-warm">
              <Image
                src="/images/home/kitchen.png"
                alt="Our kitchen"
                fill
                className="object-cover"
                sizes="50vw"
                priority
              />
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.15}>
            <h2 className="font-display text-3xl font-bold text-burgundy">How It Started</h2>
            <div className="mt-6 space-y-4 text-muted leading-relaxed">
              <p>
                What began as weekend breakfasts for friends and neighbours grew into something
                bigger — a promise to bring authentic homemade Pakistani food to every table in
                Islamabad.
              </p>
              <p>
                We chose two daily ordering windows — morning and evening — because great food
                can&apos;t be rushed or stockpiled. When you order from Yummilicious, your paratha
                is rolled fresh, your shawarma is sliced to order, and your chai is brewed right
                before it leaves our kitchen.
              </p>
              <p>
                Today, we serve hundreds of happy customers across Islamabad, but our mission
                remains the same: homemade comfort, unforgettable flavour.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <ScrollReveal className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-burgundy">Our Values</h2>
          </ScrollReveal>
          <div className="grid gap-8 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <ScrollReveal key={v.title} delay={i * 0.1}>
                <div className="rounded-3xl border border-burgundy/10 bg-cream p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-burgundy text-cream">
                    <v.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-brown">{v.title}</h3>
                  <p className="mt-3 text-sm text-muted leading-relaxed">{v.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <ScrollReveal>
            <h2 className="font-display text-3xl font-bold text-burgundy">Visit Us</h2>
            <p className="mt-4 text-muted">
              Ordering hours: {formatShiftDisplay()}
            </p>
            <div className="mt-6 space-y-2 text-brown">
              <p>
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-burgundy hover:underline"
                >
                  {CONTACT.phone}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="transition hover:text-burgundy hover:underline"
                >
                  {CONTACT.email}
                </a>
              </p>
              <p>Islamabad, Pakistan</p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
