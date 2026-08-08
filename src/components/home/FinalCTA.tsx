import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { CONTACT } from "@/lib/data/fallback";
import { formatShiftDisplay } from "@/lib/utils/store-hours";

export type CtaContent = {
  headline?: string;
  subcopy?: string;
  ctaLabel?: string;
};

export function FinalCTA({
  content,
  whatsapp,
}: {
  content?: CtaContent;
  whatsapp?: string;
}) {
  const headline = content?.headline || "Order Fresh Homemade Food Today";
  const subcopy =
    content?.subcopy ||
    `Open for ordering ${formatShiftDisplay()}. Place your order now and taste the difference.`;
  const ctaLabel = content?.ctaLabel || "Order Now";
  const wa = whatsapp || CONTACT.whatsapp;

  return (
    <section className="relative overflow-hidden bg-hero-gradient py-16 sm:py-24 lg:py-32">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-orange blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-gold blur-3xl" />
      </div>

      <ScrollReveal className="relative z-10 mx-auto max-w-3xl px-4 text-center lg:px-6">
        <span className="font-script text-2xl text-gold">Craving Something?</span>
        <h2 className="font-display mt-3 text-3xl font-bold text-cream sm:text-5xl">
          {headline}
        </h2>
        <p className="mt-4 text-lg text-cream/80">{subcopy}</p>
        <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link href="/menu" className="w-full sm:w-auto">
            <Button size="lg" magnetic className="w-full gap-2 sm:w-auto">
              {ctaLabel}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button size="lg" variant="ghost" className="w-full gap-2 border border-cream/30 sm:w-auto">
              <MessageCircle className="h-5 w-5" />
              WhatsApp Us
            </Button>
          </a>
        </div>
      </ScrollReveal>
    </section>
  );
}
