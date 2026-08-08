import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
    localPatterns: [
      { pathname: "/api/uploads/**", search: "" },
      { pathname: "/images/**", search: "" },
      { pathname: "/products/**", search: "" },
      { pathname: "/brand/**", search: "" },
    ],
  },
};

export default nextConfig;
