/*
 * ---------------------------------------------------------
 * SEO CONFIG
 * ---------------------------------------------------------
 *
 * One place for the site's identity and its canonical origin,
 * so a title, an Open Graph card and a sitemap entry can never
 * disagree about what this store is called or where it lives.
 *
 * The vocabulary below is not arbitrary. Keyword research on
 * Google Suggest with the country set to Pakistan (250 queries,
 * 2,323 raw suggestions, September 2026) found that:
 *
 *   - "stitched" and "ready to wear" are what shoppers type;
 *   - "pret" is trade jargon - on Pakistani geo it autocompletes
 *     to a sandwich chain and to "pret dress meaning in urdu",
 *     so it never appears in a title or a URL here;
 *   - "unstitched" is a different business (fabric by the yard).
 *     Every listing has to say "stitched" or "ready to wear"
 *     out loud, or that traffic lands, finds no cut cloth and
 *     bounces straight back to the results page.
 */

/**
 * The canonical origin, with no trailing slash.
 *
 * Every canonical, Open Graph URL and sitemap entry is built
 * from this, so a staging deploy that leaves it pointing at
 * production would tell Google the two are the same site. Set
 * NEXT_PUBLIC_SITE_URL there; the literal is the live domain.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://lameesofficial.com").replace(
  /\/+$/,
  ""
);

export const SITE_NAME = "Lamees";

/* Prices, and therefore every Offer in structured data. */
export const CURRENCY = "PKR";

export const LOCALE = "en_PK";

/**
 * Appended to every page title except the homepage, which sets
 * its own absolute title through `title.default`.
 */
export const TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

/*
 * The homepage carries the corpus's single highest-intent
 * phrase ("stitched dress online pakistan") together with the
 * category term, rather than the brand name alone.
 */
export const HOME_TITLE =
  "Stitched Dresses Online in Pakistan | Ready to Wear Eastern Wear for Women";

export const HOME_DESCRIPTION =
  "Shop stitched, ready to wear eastern dresses for women in Pakistan. " +
  "Lawn suits, kurtis, maxis and 3 piece suits - fully stitched, never unstitched, " +
  "with prices shown before you click. Cash on delivery nationwide.";

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
