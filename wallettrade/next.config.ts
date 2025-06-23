import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  /* config options here */
  // Add pino-pretty and encoding as externals to prevent bundling issues
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };

    // Add pino-pretty and encoding as externals to prevent bundling issues
    config.externals.push("pino-pretty", "encoding");

    return config;
  },
};

export default nextConfig;
