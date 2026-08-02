import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope, Pacifico } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fff4da",
};

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const script = Pacifico({
  variable: "--font-script",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Yummilicious | Homemade Comfort. Unforgettable Flavour.",
    template: "%s | Yummilicious",
  },
  description:
    "Freshly prepared homemade favourites — breakfasts, shawarmas, paratha rolls and tea — made with care in Pakistan. Order 9 AM–12 PM & 8 PM–11 PM.",
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "Yummilicious",
    title: "Yummilicious | Homemade Comfort. Unforgettable Flavour.",
    description:
      "Freshly prepared homemade favourites made with care and delivered with flavour.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yummilicious",
    description: "Homemade Comfort. Unforgettable Flavour.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/images/brand/logo.png", type: "image/png" }],
    apple: [{ url: "/images/brand/logo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${script.variable} h-full antialiased`}
    >
      <body
        className="min-h-full bg-cream font-body text-brown antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
