import Link from "next/link";
import { CheckCircle, MessageCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CONTACT } from "@/lib/data/fallback";

interface PageProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const { orderNumber } = await searchParams;

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-surface px-4 py-16">
      <div className="max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green/15">
          <CheckCircle className="h-12 w-12 text-green" />
        </div>
        <h1 className="font-display text-3xl font-bold text-burgundy sm:text-4xl">
          Order Placed!
        </h1>
        <p className="mt-3 text-muted">
          Thank you for ordering from Yummilicious. We&apos;re preparing your homemade favourites
          with love.
        </p>

        {orderNumber && (
          <div className="mt-8 rounded-2xl border border-burgundy/10 bg-cream p-6 shadow-warm">
            <p className="text-sm text-muted">Your order number</p>
            <p className="font-display mt-1 text-2xl font-bold tracking-wide text-burgundy">
              {orderNumber}
            </p>
            <p className="mt-2 text-xs text-muted">Save this number to track your order</p>
          </div>
        )}

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/track-order${orderNumber ? `?orderNumber=${orderNumber}` : ""}`}
            className="block w-full sm:w-auto"
          >
            <Button variant="secondary" className="w-full gap-2">
              <Package className="h-4 w-4" />
              Track Order
            </Button>
          </Link>
          <a
            href={`https://wa.me/${CONTACT.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full sm:w-auto"
          >
            <Button variant="outline" className="w-full gap-2">
              <MessageCircle className="h-4 w-4" />
              WhatsApp Us
            </Button>
          </a>
        </div>

        <Link href="/menu" className="mt-6 inline-block text-sm text-burgundy hover:underline">
          Continue browsing menu →
        </Link>
      </div>
    </div>
  );
}
