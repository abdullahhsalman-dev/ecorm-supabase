import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Turbopack infers the workspace root from the nearest lockfile, and a
   * stray package-lock.json in a parent directory makes it guess wrong (and
   * then ignore ours). This directory is the root.
   */
  turbopack: {
    root: path.join(__dirname),
  },

  images: {
    /*
     * Product and category art is served from Supabase storage; the seed
     * data points at picsum.photos. next/image refuses any host that is not
     * listed here, so a new image source has to be added before it is used.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      { protocol: "https", hostname: "picsum.photos" },
    ],
    /*
     * The optimizer skips SVG unless it is opted in. /placeholder.svg is our
     * own asset, and the CSP below keeps any SVG it does serve inert.
     */
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  async redirects() {
    return [
      /*
       * The fragrance department lived under a misspelt
       * `/fragnance` directory. Departments are now addressed by
       * their category slug, so the correct spelling is the real
       * URL - but the old one has been linked and indexed, so it
       * is redirected permanently rather than deleted.
       */
      {
        source: "/fragnance",
        destination: "/fragrance",
        permanent: true,
      },
      {
        source: "/fragnance/:subcategory",
        destination: "/fragrance/:subcategory",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
