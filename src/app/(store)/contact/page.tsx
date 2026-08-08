"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { CONTACT } from "@/lib/data/fallback";
import { contactSchema } from "@/lib/validations";
import { formatPhone } from "@/lib/utils/format";
import { formatShiftDisplay } from "@/lib/utils/store-hours";
import { cn } from "@/lib/utils/cn";
import type { z } from "zod";

type ContactForm = z.infer<typeof contactSchema>;

const DEFAULT_INSTAGRAM = [
  {
    href: "https://www.instagram.com/yummilicious.pk/",
    label: "@yummilicious.pk",
  },
  {
    href: "https://www.instagram.com/__yummilicious___/",
    label: "@__yummilicious___",
  },
] as const;

const inputClass =
  "focus-ring w-full rounded-2xl border border-burgundy/12 bg-white/90 px-4 py-3 text-base text-brown placeholder:text-muted/50 transition hover:border-burgundy/25 sm:text-sm";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [siteContact, setSiteContact] = useState({
    phone: CONTACT.phone,
    email: CONTACT.email,
    whatsapp: CONTACT.whatsapp,
    address: "",
    city: "Islamabad",
    instagram: "",
  });
  const [hero, setHero] = useState({
    eyebrow: "Get in Touch",
    headline: "We'd Love to Hear From You",
    subcopy:
      "Questions, feedback, catering, or just a craving — message us anytime. Fresh homemade replies, same as our food.",
    image: "/images/home/kitchen.png",
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((s) => {
        if (!s || s.error) return;
        setSiteContact({
          phone: s.phone || CONTACT.phone,
          email: s.email || CONTACT.email,
          whatsapp: s.whatsappNumber || CONTACT.whatsapp,
          address: s.address || "",
          city: s.city || "Islamabad",
          instagram: s.socialLinks?.instagram || "",
        });
      })
      .catch(() => {});

    fetch("/api/pages?slug=contact", { cache: "no-store" })
      .then((r) => r.json())
      .then((page) => {
        const fields = Object.fromEntries(
          (page?.sections?.find((s: { key: string }) => s.key === "hero")?.fields || []).map(
            (f: { key: string; value: string }) => [f.key, f.value]
          )
        ) as Record<string, string>;
        if (!Object.keys(fields).length) return;
        setHero((prev) => ({
          eyebrow: fields.eyebrow || prev.eyebrow,
          headline: fields.headline || prev.headline,
          subcopy: fields.subcopy || prev.subcopy,
          image: fields.image || prev.image,
        }));
      })
      .catch(() => {});
  }, []);

  const INSTAGRAM = siteContact.instagram
    ? [{ href: siteContact.instagram, label: siteContact.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "") }]
    : DEFAULT_INSTAGRAM;

  const onSubmit = async (data: ContactForm) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send");
      toast.success(json.message || "Message sent!");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#FFF4DA]">
        <div className="absolute inset-0">
          <Image
            src={
              hero.image?.startsWith("/uploads/")
                ? "/images/home/kitchen.png"
                : hero.image || "/images/home/kitchen.png"
            }
            alt=""
            fill
            priority
            className="object-cover object-center opacity-[0.22]"
            sizes="100vw"
            unoptimized={(hero.image || "").startsWith("/api/uploads/")}
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#FFF4DA]/85 via-[#FFF4DA]/92 to-[#fffaf0]"
            aria-hidden
          />
          <div
            className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-orange/15 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-burgundy/10 blur-3xl"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-14 text-center sm:px-6 lg:pb-20 lg:pt-20">
          <ScrollReveal>
            <span className="font-script text-2xl text-orange sm:text-3xl">
              {hero.eyebrow}
            </span>
            <h1 className="font-display mt-3 text-[2rem] font-bold tracking-tight text-burgundy sm:text-5xl lg:text-6xl">
              {hero.headline}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {hero.subcopy}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="mt-8">
            <div className="mx-auto inline-flex max-w-full items-center gap-2 rounded-full border border-burgundy/15 bg-cream/80 px-4 py-2.5 text-left text-xs text-brown shadow-warm backdrop-blur-sm sm:px-5 sm:text-sm">
              <Clock className="h-4 w-4 shrink-0 text-orange" aria-hidden />
              <span className="min-w-0 leading-snug">
                Ordering ·{" "}
                <span className="font-semibold text-burgundy">{formatShiftDisplay()}</span>
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-surface pb-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Contact channels */}
            <ScrollReveal className="lg:col-span-5">
              <div className="space-y-4">
                <p className="font-display text-sm font-bold uppercase tracking-wider text-orange">
                  Reach Us
                </p>
                <h2 className="font-display text-2xl font-bold text-burgundy sm:text-3xl">
                  Talk to the kitchen crew
                </h2>

                <a
                  href={`https://wa.me/${siteContact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-3xl border border-burgundy/10 bg-cream px-5 py-5 transition hover:-translate-y-0.5 hover:border-green/30 hover:shadow-warm"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green text-cream shadow-md transition group-hover:scale-105">
                    <MessageCircle className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block font-display text-lg font-bold text-brown">
                      WhatsApp
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      Fastest way · {formatPhone(siteContact.phone)}
                    </span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-muted transition group-hover:text-green" />
                </a>

                <a
                  href={`tel:${siteContact.phone}`}
                  className="group flex items-center gap-4 rounded-3xl border border-burgundy/10 bg-cream px-5 py-5 transition hover:-translate-y-0.5 hover:border-burgundy/25 hover:shadow-warm"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-burgundy text-cream shadow-md transition group-hover:scale-105">
                    <Phone className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block font-display text-lg font-bold text-brown">
                      Call Us
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {formatPhone(siteContact.phone)}
                    </span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-muted transition group-hover:text-burgundy" />
                </a>

                <a
                  href={`mailto:${siteContact.email}`}
                  className="group flex items-center gap-4 rounded-3xl border border-burgundy/10 bg-cream px-5 py-5 transition hover:-translate-y-0.5 hover:border-orange/40 hover:shadow-warm"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange text-cream shadow-md transition group-hover:scale-105">
                    <Mail className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block font-display text-lg font-bold text-brown">
                      Email
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-muted">
                      {siteContact.email}
                    </span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-muted transition group-hover:text-orange" />
                </a>

                <div className="flex items-center gap-4 rounded-3xl border border-dashed border-burgundy/20 bg-white/50 px-5 py-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold/90 text-brown shadow-md">
                    <MapPin className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-display text-lg font-bold text-brown">Based in</p>
                    <p className="mt-0.5 text-sm text-muted">
                      {siteContact.address
                        ? `${siteContact.address}${siteContact.city ? `, ${siteContact.city}` : ""}`
                        : `${siteContact.city || "Islamabad"}, Pakistan`}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="mb-3 text-sm font-semibold text-brown">Follow on Instagram</p>
                  <div className="flex flex-wrap gap-2">
                    {INSTAGRAM.map((ig) => (
                      <a
                        key={ig.href}
                        href={ig.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-ring inline-flex items-center gap-2 rounded-full border border-burgundy/15 bg-cream px-4 py-2 text-sm font-medium text-brown transition hover:border-orange/40 hover:text-burgundy"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                          <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.9A3.1 3.1 0 1 1 12 8.9a3.1 3.1 0 0 1 0 6.2zm6.1-8.1a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0zM12 2.5c-2.6 0-2.9 0-3.9.06-1.98.09-3.65 1.74-3.74 3.74C4.3 7.4 4.3 7.7 4.3 10.3s0 2.9.06 3.9c.09 1.98 1.74 3.65 3.74 3.74 1 .05 1.3.06 3.9.06s2.9 0 3.9-.06c1.98-.09 3.65-1.74 3.74-3.74.05-1 .06-1.3.06-3.9s0-2.9-.06-3.9c-.09-1.98-1.74-3.65-3.74-3.74-1-.05-1.3-.06-3.9-.06zm0 15.4c-2.55 0-2.85 0-3.85-.06-1.5-.07-2.74-1.3-2.8-2.8-.06-1-.06-1.3-.06-3.85s0-2.85.06-3.85c.07-1.5 1.3-2.74 2.8-2.8 1-.06 1.3-.06 3.85-.06s2.85 0 3.85.06c1.5.07 2.74 1.3 2.8 2.8.06 1 .06 1.3.06 3.85s0 2.85-.06 3.85c-.07 1.5-1.3 2.74-2.8 2.8-1 .06-1.3.06-3.85.06z" />
                        </svg>
                        {ig.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Form */}
            <ScrollReveal direction="right" delay={0.08} className="lg:col-span-7">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="relative overflow-hidden rounded-[2rem] border border-burgundy/10 bg-cream p-5 shadow-warm sm:p-8 lg:p-10"
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange/10 blur-2xl"
                  aria-hidden
                />
                <div className="relative">
                  <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-script text-xl text-orange">Write to us</p>
                      <h2 className="font-display mt-1 text-2xl font-bold text-burgundy sm:text-3xl">
                        Send a Message
                      </h2>
                      <p className="mt-2 text-sm text-muted">
                        We usually reply within a few hours during ordering windows.
                      </p>
                    </div>
                    <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-burgundy/8 text-burgundy sm:flex">
                      <Send className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-brown">
                        Name *
                      </label>
                      <input
                        id="name"
                        placeholder="Your name"
                        {...register("name")}
                        className={inputClass}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-burgundy">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-brown">
                        Phone
                      </label>
                      <input
                        id="phone"
                        placeholder="03XX-XXXXXXX"
                        {...register("phone")}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-brown">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="you@email.com"
                        {...register("email")}
                        className={inputClass}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-burgundy">{errors.email.message}</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="subject" className="mb-1.5 block text-sm font-semibold text-brown">
                        Subject
                      </label>
                      <input
                        id="subject"
                        placeholder="Catering, feedback, order help…"
                        {...register("subject")}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-brown">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Tell us how we can help…"
                        {...register("message")}
                        className={cn(inputClass, "resize-y min-h-[120px]")}
                      />
                      {errors.message && (
                        <p className="mt-1 text-xs text-burgundy">{errors.message.message}</p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    loading={submitting}
                    className="mt-6 w-full gap-2"
                    size="lg"
                    magnetic
                  >
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </form>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
