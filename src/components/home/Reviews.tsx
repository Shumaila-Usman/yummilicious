import { Star } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { FALLBACK_REVIEWS } from "@/lib/data/fallback";

interface Review {
  name: string;
  rating: number;
  comment: string;
  date?: string;
}

interface ReviewsProps {
  reviews?: Review[];
}

export function Reviews({ reviews = FALLBACK_REVIEWS }: ReviewsProps) {
  return (
    <section className="bg-surface py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <ScrollReveal className="mb-12 text-center">
          <span className="font-script text-xl text-orange">Happy Customers</span>
          <h2 className="font-display mt-2 text-3xl font-bold text-burgundy sm:text-4xl">
            What Islamabad Says
          </h2>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reviews.slice(0, 4).map((review, i) => (
            <ScrollReveal key={review.name} delay={i * 0.08}>
              <blockquote className="flex h-full flex-col rounded-3xl border border-burgundy/10 bg-cream p-6 shadow-warm">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${s < review.rating ? "fill-gold text-gold" : "text-burgundy/20"}`}
                    />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-muted">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <footer className="mt-4 border-t border-burgundy/10 pt-4">
                  <cite className="font-display not-italic font-bold text-brown">
                    {review.name}
                  </cite>
                  {review.date && (
                    <p className="text-xs text-muted">{review.date}</p>
                  )}
                </footer>
              </blockquote>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
