/*
 * ---------------------------------------------------------
 * DEPARTMENTS
 * ---------------------------------------------------------
 *
 * A department landing page is generated for any top-level
 * row in `categories`, by /[department]. Creating a department
 * is therefore an admin action, not a deploy.
 *
 * What the categories table cannot hold is editorial: hero
 * copy, a call-to-action label, promo tiles, and the fact that
 * Women leads with "Trending Now" where Men leads with "Best
 * Sellers". That lives in OVERRIDES below, keyed by slug and
 * entirely optional - a department with no entry still gets a
 * complete page built from its own row.
 *
 * /sale and /new-arrivals are not departments. They are routes
 * rather than category rows, and their pages differ enough
 * that forcing them into this shape would cost more than it
 * saves.
 */

import type { CategoryRecord } from "@/src/app/lib/categories";

/*
 * Slugs that can never be a department, because a static route
 * of the same name already answers that URL. Next resolves
 * static segments before dynamic ones, so a category called
 * "products" would simply be unreachable - better to refuse it
 * than to ship a page nobody can open.
 */
export const RESERVED_SLUGS = new Set([
  "account",
  "admin",
  "api",
  "cart",
  "categories",
  "checkout",
  "forgot-password",
  "login",
  "new-arrivals",
  "products",
  "reset-password",
  "sale",
  "signup",
]);

export interface DepartmentSection {
  /* Anchor id, so the hero button can actually scroll to it. */
  id: string;
  title: string;
  /* Passed to ProductGrid, and to /products for "View all". */
  sort: string;
}

export interface Department {
  slug: string;
  name: string;
  /* Prepended to the grid headings, e.g. "Men's". */
  metaTitle: string;
  metaDescription: string;
  hero: {
    title: string;
    description: string;
    primaryCta: string;
  };
  /*
   * One product rail. There used to be two - "New Arrivals" and
   * "Trending Now" / "Best Sellers" - but the schema has no
   * sales counters, so `trending` and `best-selling` both fell
   * through applySort to the same default ordering: the same
   * query, run twice, under two headings.
   */
  section: DepartmentSection;
  /* The category's own banner, when the admin has uploaded one. */
  imageUrl: string | null;
}

const NEW_ARRIVALS: DepartmentSection = {
  id: "new-arrivals",
  title: "New Arrivals",
  sort: "newest",
};

/*
 * An entry may set any part of a department. `slug` selects the
 * row it applies to; `name` is allowed so the literal below
 * reads as a department rather than a bag of strings, but the
 * category row is what actually supplies it.
 */
type DepartmentOverride = Partial<Department>;

const OVERRIDES: Record<string, DepartmentOverride> = Object.fromEntries(
  (
    [
      {
        slug: "men",
        name: "Men",
        metaTitle: "Men's Collection",
        metaDescription: "Discover our latest men's fashion collection for every occasion",
        hero: {
          title: "Men's Collection",
          description:
            "Discover our latest men's fashion collection featuring premium quality clothing for every occasion.",
          primaryCta: "Shop New Arrivals",
        },
      },
      {
        slug: "women",
        name: "Women",
        metaTitle: "Women's Collection",
        metaDescription: "Explore our stunning women's fashion collection for every style",
        hero: {
          title: "Women's Collection",
          description:
            "Explore our stunning women's fashion collection featuring elegant designs for every style and occasion.",
          primaryCta: "Shop New Arrivals",
        },
      },
      {
        slug: "kids",
        name: "Kids",
        metaTitle: "Kids Collection",
        metaDescription: "Shop our collection of kids clothing and accessories",
        hero: {
          title: "Kids Collection",
          description:
            "Adorable and comfortable clothing for kids of all ages. From everyday wear to special occasions.",
          primaryCta: "Shop New Arrivals",
        },
      },
      {
        slug: "footwear",
        name: "Footwear",
        metaTitle: "Footwear Collection",
        metaDescription: "Shop our collection of footwear for men, women, and kids",
        hero: {
          title: "Footwear Collection",
          description:
            "Step out in style with our premium footwear collection for men, women, and kids.",
          primaryCta: "Shop New Arrivals",
        },
      },
      {
        slug: "fragrance",
        name: "Fragrance",
        metaTitle: "Fragrance Collection",
        metaDescription: "Discover our exclusive collection of fragrances for men and women",
        hero: {
          title: "Fragrance Collection",
          description: "Discover our exclusive collection of premium fragrances for men and women.",
          primaryCta: "Shop New Arrivals",
        },
      },
      {
        slug: "winter-wear",
        name: "Winter Wear",
        metaTitle: "Winter Wear Collection",
        metaDescription: "Stay warm in style with our premium winter wear collection",
        hero: {
          title: "Winter Collection",
          description:
            "Stay warm and stylish with our premium winter wear collection for the whole family.",
          primaryCta: "Shop Collection",
        },
      },
    ] as (DepartmentOverride & { slug: string })[]
  ).map(({ slug, ...override }) => [slug, override])
);

/* Title Case from a slug: "winter-wear" -> "Winter Wear". */
const titleFromSlug = (slug: string): string =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/**
 * Build the landing page's content for one top-level category.
 *
 * Everything has a sensible value derived from the row, so a
 * department created in the admin this morning renders a
 * finished page; an OVERRIDES entry only replaces the parts
 * somebody has written better copy for.
 */
export function buildDepartment(category: CategoryRecord): Department {
  const override = OVERRIDES[category.slug] ?? {};

  const name = category.name || titleFromSlug(category.slug);

  const description = category.description ?? `Explore our ${name.toLowerCase()} collection.`;

  return {
    slug: category.slug,
    name,
    metaTitle: override.metaTitle ?? name,
    metaDescription: override.metaDescription ?? description,
    hero: {
      title: override.hero?.title ?? name,
      description: override.hero?.description ?? description,
      primaryCta: override.hero?.primaryCta ?? "Shop New Arrivals",
    },
    section: override.section ?? NEW_ARRIVALS,
    /*
     * Straight off the row. The page used to render a fixed
     * /assets/kids.webp for every department, so /women showed
     * a photo of children.
     */
    imageUrl: category.image_url,
  };
}
