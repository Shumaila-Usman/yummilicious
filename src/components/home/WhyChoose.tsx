import { ChefHat, Clock, Heart, Leaf } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const REASONS = [
  {
    icon: ChefHat,
    title: "Homemade Quality",
    description:
      "Every dish prepared fresh to order — no pre-made batches sitting under heat lamps.",
  },
  {
    icon: Clock,
    title: "Timed Ordering",
    description:
      "Two daily windows (9–12 AM & 8–11 PM) ensure peak freshness for every delivery.",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description:
      "Family recipes, hand-rolled parathas, and karak chai brewed the traditional way.",
  },
  {
    icon: Leaf,
    title: "Quality Ingredients",
    description:
      "Premium spices, fresh produce, and halal meats sourced from trusted local suppliers.",
  },
];

export type WhyContent = {
  headline?: string;
  subcopy?: string;
};

export function WhyChoose({ content }: { content?: WhyContent }) {
  const headline = content?.headline || "The Yummilicious Difference";
  const subcopy = content?.subcopy || "";

  return (
    <section className="py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <ScrollReveal className="mb-14 text-center">
          <span className="font-script text-xl text-orange">Why Yummilicious?</span>
          <h2 className="font-display mt-2 text-3xl font-bold text-burgundy sm:text-4xl">
            {headline}
          </h2>
          {subcopy ? (
            <p className="mx-auto mt-3 max-w-2xl text-muted">{subcopy}</p>
          ) : null}
        </ScrollReveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason, i) => (
            <ScrollReveal key={reason.title} delay={i * 0.08}>
              <div className="group rounded-3xl border border-burgundy/10 bg-white/60 p-6 text-center transition hover:-translate-y-1 hover:shadow-warm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-burgundy to-orange text-cream transition group-hover:scale-110">
                  <reason.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-lg font-bold text-brown">{reason.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{reason.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
