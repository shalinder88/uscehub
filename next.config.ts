import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Block search engines from indexing the Vercel preview URL
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "(?!uscehub\\.com).*",
          },
        ],
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
