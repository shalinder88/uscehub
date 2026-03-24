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
      {
        // Security headers for all pages
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        // Redirect old /freida route to /img-resources
        source: "/freida",
        destination: "/img-resources",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
