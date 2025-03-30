import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['i.ibb.co'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* andere Konfigurationsoptionen hier */
};

export default nextConfig;