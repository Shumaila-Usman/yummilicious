import { connectDB } from "@/lib/db/connect";
import { Faq } from "@/models";
import { PageHero } from "@/components/ui/PageHero";
import { getPageFields } from "@/lib/cms/get-page";
import { FaqAccordion } from "@/components/store/FaqAccordion";

export const metadata = {
  title: "FAQs",
  description: "Frequently asked questions about ordering from Yummilicious.",
};

const DEFAULT_FAQS = [
  {
    _id: "d1",
    question: "What are your ordering hours?",
    answer:
      "We take orders in two daily windows (Pakistan time): morning and evening. Check the site banner or contact page for exact times.",
  },
  {
    _id: "d2",
    question: "Where do you deliver?",
    answer: "We deliver across selected areas in Islamabad. Message us on WhatsApp to confirm your area.",
  },
  {
    _id: "d3",
    question: "How do I pay?",
    answer:
      "Pay securely on the site via JazzCash when the payment gateway is enabled. You can also contact us on WhatsApp for help.",
  },
];

export default async function FaqsPage() {
  const hero = await getPageFields("faqs", "hero");
  let faqs = DEFAULT_FAQS;

  try {
    await connectDB();
    const docs = await Faq.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
    if (docs.length) {
      faqs = docs.map((d) => ({
        _id: String(d._id),
        question: d.question,
        answer: d.answer,
      }));
    }
  } catch {
    /* defaults */
  }

  return (
    <div>
      <PageHero
        eyebrow={hero.eyebrow}
        headline={hero.headline || "Frequently Asked Questions"}
        subcopy={hero.subcopy}
        image={hero.image}
      />
      <section className="bg-surface py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <FaqAccordion items={faqs} />
        </div>
      </section>
    </div>
  );
}
