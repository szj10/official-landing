import type { NextConfig } from "next";

const STUDIO_BACKEND_URL = process.env.STUDIO_BACKEND_URL || "http://localhost:8020";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${STUDIO_BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
