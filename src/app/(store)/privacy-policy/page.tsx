import { ScrollReveal } from "@/components/animations/ScrollReveal";

export const metadata = {
  title: "Privacy Policy",
  description: "Yummilicious privacy policy — how we collect and protect your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-surface py-12 lg:py-16">
      <div className="mx-auto max-w-3xl px-4 lg:px-6">
        <ScrollReveal>
          <h1 className="font-display text-3xl font-bold text-burgundy sm:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted">Last updated: August 2026</p>

          <div className="prose prose-brown mt-8 space-y-6 text-muted leading-relaxed">
            <section>
              <h2 className="font-display text-xl font-bold text-brown">Information We Collect</h2>
              <p>
                When you place an order, we collect your name, phone number, delivery address,
                and optionally your email. We use this information solely to process and deliver
                your order and communicate about its status.
              </p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-brown">How We Use Your Data</h2>
              <p>
                Your personal information is used to fulfil orders, improve our service, and
                send order-related notifications via phone, WhatsApp, or email. We do not sell
                or share your data with third parties for marketing purposes.
              </p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-brown">Data Storage</h2>
              <p>
                Order data is stored securely on encrypted servers. We retain order history
                to improve our service and resolve any disputes. You may request deletion of
                your personal data by contacting us.
              </p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-brown">Contact</h2>
              <p>
                For privacy-related inquiries, contact us at yummilicious321@gmail.com or
                call 03369863734.
              </p>
            </section>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
