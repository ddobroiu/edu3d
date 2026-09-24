import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "replicate.delivery" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "edu3d.ro" },
      { protocol: "https", hostname: "www.edu3d.ro" },
    ],
  },
  async headers() {
    return [
      {
        // WebXR si model-viewer au nevoie de aceste permisiuni
        source: "/(.*)",
        headers: [
          { key: "Permissions-Policy", value: "xr-spatial-tracking=(self), camera=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
