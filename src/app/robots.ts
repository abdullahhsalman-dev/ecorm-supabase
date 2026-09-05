import { absoluteUrl } from "@/src/app/lib/seo";
import type { MetadataRoute } from "next";

/*
 * ---------------------------------------------------------
 * robots.txt
 * ---------------------------------------------------------
 *
 * The disallow list is everything that is either private or
 * worthless in an index. The back office and the account
 * screens are behind a login and would only ever be soft 404s
 * to a crawler; /checkout and /cart are per-session; /api
 * returns JSON.
 *
 * Note what is NOT disallowed: /products with a query string.
 * Those filtered views carry canonicals back to the clean URL,
 * which is the right instruction - blocking them here would
 * stop the crawler ever reading that canonical.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/account",
        "/cart",
        "/checkout",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
