import type { NextConfig } from "next";

const STUDIO_BACKEND_URL = process.env.STUDIO_BACKEND_URL || "http://localhost:8020";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "s3.filebase.io",
      },
      {
        protocol: "https",
        hostname: "r2.cloudflarestorage.com",
      },
    ],
  },
  allowedDevOrigins: ["192.168.50.111"],
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
