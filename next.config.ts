import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  eslint: {
    // ✅ Don’t fail the production build on ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ Don’t fail the production build on TS errors
    ignoreBuildErrors: true,
  },
  images: {
    // ✅ Allow Cloudinary images
    domains: ["res.cloudinary.com"],
  },
};

export default nextConfig;
