import type { IPageContent, IPageSection } from "@/models/PageContent";

export type PageSlug =
  | "home"
  | "about"
  | "menu"
  | "gallery"
  | "testimonials"
  | "faqs"
  | "contact";

export const PAGE_LIST: { slug: PageSlug; title: string; description: string }[] = [
  { slug: "home", title: "Home", description: "Landing page sections & images" },
  { slug: "about", title: "About", description: "Story, values, kitchen imagery" },
  { slug: "menu", title: "Menu", description: "Menu page hero" },
  { slug: "gallery", title: "Gallery", description: "Gallery page hero" },
  { slug: "testimonials", title: "Testimonials", description: "Testimonials page hero" },
  { slug: "faqs", title: "FAQs", description: "FAQs page hero" },
  { slug: "contact", title: "Contact", description: "Contact page hero (details from Settings)" },
];

function section(
  key: string,
  title: string,
  fields: { key: string; label: string; type: "text" | "textarea" | "image"; value: string }[]
): IPageSection {
  return { key, title, fields };
}

export const DEFAULT_PAGES: Record<PageSlug, Omit<IPageContent, "createdAt" | "updatedAt">> = {
  home: {
    slug: "home",
    title: "Home",
    sections: [
      section("hero", "Hero", [
        { key: "eyebrow", label: "Eyebrow", type: "text", value: "Homemade • Fresh • Full of Flavour" },
        { key: "headline", label: "Headline", type: "text", value: "Homemade Flavour, Made to Make You Smile." },
        {
          key: "subcopy",
          label: "Supporting text",
          type: "textarea",
          value:
            "From comforting breakfasts to generously filled shawarmas and paratha rolls, every order is freshly prepared with homemade care.",
        },
        { key: "ctaPrimary", label: "Primary CTA label", type: "text", value: "Order Your Favourites" },
        { key: "ctaSecondary", label: "Secondary CTA label", type: "text", value: "Explore the Menu" },
        { key: "image", label: "Hero background image", type: "image", value: "/images/hero/hero-bg.png" },
      ]),
      section("story", "Story section", [
        { key: "eyebrow", label: "Eyebrow", type: "text", value: "Our Kitchen" },
        { key: "headline", label: "Headline", type: "text", value: "Food that feels like home" },
        {
          key: "body",
          label: "Body",
          type: "textarea",
          value:
            "We cook in short windows so every plate leaves the kitchen fresh — parathas rolled to order, chai poured hot, shawarma packed with care.",
        },
        { key: "image", label: "Section image", type: "image", value: "/images/home/kitchen.png" },
      ]),
      section("why", "Why choose us", [
        { key: "headline", label: "Headline", type: "text", value: "Why Yummilicious" },
        {
          key: "subcopy",
          label: "Supporting text",
          type: "textarea",
          value: "Homemade recipes, generous portions, and ordering windows that keep every bite fresh.",
        },
      ]),
      section("cta", "Final CTA", [
        { key: "headline", label: "Headline", type: "text", value: "Craving something homemade?" },
        {
          key: "subcopy",
          label: "Supporting text",
          type: "textarea",
          value: "Order during our morning or evening window and taste the difference.",
        },
        { key: "ctaLabel", label: "Button label", type: "text", value: "Order Now" },
        { key: "image", label: "Background / side image", type: "image", value: "/images/home/kitchen.png" },
      ]),
    ],
  },
  about: {
    slug: "about",
    title: "About",
    sections: [
      section("hero", "Hero", [
        { key: "eyebrow", label: "Eyebrow", type: "text", value: "Our Story" },
        { key: "headline", label: "Headline", type: "text", value: "Homemade with Heart" },
        {
          key: "subcopy",
          label: "Supporting text",
          type: "textarea",
          value:
            "Yummilicious was born from a kitchen, not a boardroom — with recipes passed down and flavours that feel like home.",
        },
        { key: "image", label: "Hero background (optional)", type: "image", value: "" },
      ]),
      section("story", "How it started", [
        { key: "headline", label: "Headline", type: "text", value: "How It Started" },
        {
          key: "body",
          label: "Body paragraphs (separate with blank line)",
          type: "textarea",
          value:
            "What began as weekend breakfasts for friends and neighbours grew into something bigger — a promise to bring authentic homemade Pakistani food to every table in Islamabad.\n\nWe chose two daily ordering windows — morning and evening — because great food can't be rushed or stockpiled.\n\nToday, we serve hundreds of happy customers across Islamabad, but our mission remains the same: homemade comfort, unforgettable flavour.",
        },
        { key: "image", label: "Kitchen image", type: "image", value: "/images/home/kitchen.png" },
      ]),
      section("values", "Values intro", [
        { key: "headline", label: "Headline", type: "text", value: "What We Stand For" },
        {
          key: "subcopy",
          label: "Supporting text",
          type: "textarea",
          value: "Passion, freshness, and community in every order.",
        },
      ]),
    ],
  },
  menu: {
    slug: "menu",
    title: "Menu",
    sections: [
      section("hero", "Hero", [
        { key: "eyebrow", label: "Eyebrow", type: "text", value: "Full Menu" },
        { key: "headline", label: "Headline", type: "text", value: "Explore Our Menu" },
        {
          key: "subcopy",
          label: "Supporting text",
          type: "textarea",
          value: "Breakfast, rolls, shawarma, chai — freshly prepared in our ordering windows.",
        },
        { key: "image", label: "Hero / background image", type: "image", value: "/images/hero/hero-bg.png" },
      ]),
    ],
  },
  gallery: {
    slug: "gallery",
    title: "Gallery",
    sections: [
      section("hero", "Hero", [
        { key: "eyebrow", label: "Eyebrow", type: "text", value: "From Our Kitchen" },
        { key: "headline", label: "Headline", type: "text", value: "Gallery" },
        {
          key: "subcopy",
          label: "Supporting text",
          type: "textarea",
          value: "A look at the plates, rolls, and chai we send out every day.",
        },
        { key: "image", label: "Hero / background image", type: "image", value: "/images/hero/hero-bg.png" },
      ]),
    ],
  },
  testimonials: {
    slug: "testimonials",
    title: "Testimonials",
    sections: [
      section("hero", "Hero", [
        { key: "eyebrow", label: "Eyebrow", type: "text", value: "Happy Customers" },
        { key: "headline", label: "Headline", type: "text", value: "What People Say" },
        {
          key: "subcopy",
          label: "Supporting text",
          type: "textarea",
          value: "Real feedback from neighbours who order with us again and again.",
        },
        { key: "image", label: "Hero / background image", type: "image", value: "/images/hero/hero-bg.png" },
      ]),
    ],
  },
  faqs: {
    slug: "faqs",
    title: "FAQs",
    sections: [
      section("hero", "Hero", [
        { key: "eyebrow", label: "Eyebrow", type: "text", value: "Help" },
        { key: "headline", label: "Headline", type: "text", value: "Frequently Asked Questions" },
        {
          key: "subcopy",
          label: "Supporting text",
          type: "textarea",
          value: "Ordering windows, delivery, payments, and more.",
        },
        { key: "image", label: "Hero / background image", type: "image", value: "/images/hero/hero-bg.png" },
      ]),
    ],
  },
  contact: {
    slug: "contact",
    title: "Contact",
    sections: [
      section("hero", "Hero", [
        { key: "eyebrow", label: "Eyebrow", type: "text", value: "Get in Touch" },
        { key: "headline", label: "Headline", type: "text", value: "Contact Us" },
        {
          key: "subcopy",
          label: "Supporting text",
          type: "textarea",
          value: "Phone, WhatsApp, and email — or send us a message below. Contact details are managed in Settings.",
        },
        { key: "image", label: "Hero / background image", type: "image", value: "/images/hero/hero-bg.png" },
      ]),
    ],
  },
};

export function fieldMap(sections: IPageSection[], sectionKey: string): Record<string, string> {
  const sec = sections.find((s) => s.key === sectionKey);
  if (!sec) return {};
  return Object.fromEntries(sec.fields.map((f) => [f.key, f.value ?? ""]));
}

export function mergePageWithDefaults(
  slug: PageSlug,
  stored?: { title?: string; sections?: IPageSection[] } | null
): Omit<IPageContent, "createdAt" | "updatedAt"> {
  const defaults = DEFAULT_PAGES[slug];
  if (!stored?.sections?.length) return structuredClone(defaults);

  const sections = defaults.sections.map((defSec) => {
    const storedSec = stored.sections?.find((s) => s.key === defSec.key);
    if (!storedSec) return structuredClone(defSec);
    return {
      ...defSec,
      title: storedSec.title || defSec.title,
      fields: defSec.fields.map((defField) => {
        const storedField = storedSec.fields?.find((f) => f.key === defField.key);
        return {
          ...defField,
          value: storedField?.value ?? defField.value,
        };
      }),
    };
  });

  // Keep any extra custom sections admin may have added
  const extra = (stored.sections || []).filter(
    (s) => !defaults.sections.some((d) => d.key === s.key)
  );

  return {
    slug,
    title: stored.title || defaults.title,
    sections: [...sections, ...extra],
  };
}
