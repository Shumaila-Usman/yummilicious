import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pre Order",
  description:
    "Bulk & advance pre-orders for gatherings — book 1–2 days ahead with 100% advance payment. Homemade food from Yummilicious, Islamabad.",
};

export default function PreOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
