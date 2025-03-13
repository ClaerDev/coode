import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // dynamicIO: true,
    authInterrupts: true,
  },
};

export default nextConfig;
