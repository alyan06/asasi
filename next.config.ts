import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a stray lockfile exists in the parent dir).
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ircrirnzghxmewatalaa.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
