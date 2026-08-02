import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Button } from "@/components/ui/Button";

export function StorySection() {
  return (
    <section className="overflow-hidden bg-surface py-14 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-6">
        <ScrollReveal direction="left">
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-burgundy/20 to-orange/20 blur-xl" />
            <div className="relative grid grid-cols-2 gap-3">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream">
                <Image
                  src="/images/home/kitchen.png"
                  alt="Our homemade kitchen"
                  fill
                  className="object-cover"
                  sizes="300px"
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
          <span className="font-script text-xl text-orange">Our Story</span>
          <h2 className="font-display mt-2 text-3xl font-bold text-burgundy sm:text-4xl">
            From Our Kitchen to Your Table
          </h2>
          <div className="mt-6 space-y-4 text-muted leading-relaxed">
            <p>
              Yummilicious began with a simple belief: food should feel like home. Every paratha
              rolled by hand, every shawarma marinated overnight, every cup of chai brewed with
              patience — that&apos;s the love we put into every order.
            </p>
            <p>
              We&apos;re not a factory kitchen. We&apos;re a family of food lovers in Islamabad,
              crafting homemade comfort for busy mornings and hungry evenings. Our limited ordering
              windows ensure everything arrives fresh, never sitting under a heat lamp.
            </p>
          </div>
          <Link href="/about" className="mt-8 inline-block">
            <Button variant="secondary">Read Our Full Story</Button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
