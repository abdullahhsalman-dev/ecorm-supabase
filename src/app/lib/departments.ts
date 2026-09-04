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
  "contact",
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

export interface DepartmentPromo {
  title: string;
  description: string;
  /* Route segment under the department, e.g. "formal". */
  segment: string;
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
  sections: [DepartmentSection, DepartmentSection];
  /* Empty when nobody has written tiles for this department. */
  promos: DepartmentPromo[];
}

const NEW_ARRIVALS: DepartmentSection = {
  id: "new-arrivals",
  title: "New Arrivals",
  sort: "newest",
};

const BEST_SELLERS: DepartmentSection = {
  id: "best-sellers",
  title: "Best Sellers",
  sort: "best-selling",
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
        sections: [NEW_ARRIVALS, BEST_SELLERS],
        promos: [
          {
            title: "Formal Collection",
            description: "Elevate your style with our premium formal wear collection.",
            segment: "formal",
          },
          {
            title: "Casual Collection",
            description: "Comfort meets style in our casual wear collection.",
            segment: "casual",
          },
        ],
      },
      {
        slug: "women",
        name: "Women",
        /*
         * The store's most important category page, so it carries
         * the tier-2 phrase verbatim rather than "Women's
         * Collection", which nobody searches for.
         */
        metaTitle: "Ready to Wear Dresses for Women in Pakistan",
        metaDescription:
          "Stitched, ready to wear dresses for women in Pakistan. Lawn suits, kurtis, maxis, " +
          "frocks and 3 piece suits - all sold fully stitched, with prices shown.",
        hero: {
          title: "Women's Collection",
          description:
            "Explore our stunning women's fashion collection featuring elegant designs for every style and occasion.",
          primaryCta: "Shop New Arrivals",
        },
        sections: [NEW_ARRIVALS, { id: "trending", title: "Trending Now", sort: "trending" }],
        promos: [
          {
            title: "Ethnic Collection",
            description: "Celebrate tradition with our elegant ethnic wear collection.",
            segment: "ethnic",
          },
          {
            title: "Western Collection",
            description: "Modern styles for the contemporary woman.",
            segment: "western",
          },
        ],
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
        sections: [NEW_ARRIVALS, BEST_SELLERS],
        promos: [
          {
            title: "Boys Collection",
            description: "Stylish and comfortable clothing for boys of all ages.",
            segment: "boys",
          },
          {
            title: "Girls Collection",
            description: "Beautiful and trendy outfits for girls of all ages.",
            segment: "girls",
          },
        ],
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
        sections: [NEW_ARRIVALS, BEST_SELLERS],
        promos: [
          {
            title: "Men's Footwear",
            description: "Stylish and comfortable footwear for men.",
            segment: "men",
          },
          {
            title: "Women's Footwear",
            description: "Elegant and trendy footwear for women.",
            segment: "women",
          },
        ],
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
        sections: [NEW_ARRIVALS, BEST_SELLERS],
        promos: [
          {
            title: "Men's Fragrances",
            description: "Discover our collection of masculine scents.",
            segment: "men",
          },
          {
            title: "Women's Fragrances",
            description: "Explore our collection of feminine scents.",
            segment: "women",
          },
        ],
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
        sections: [{ id: "featured", title: "Featured Collection", sort: "newest" }, BEST_SELLERS],
        promos: [
          {
            title: "Men's Winter Collection",
            description: "Stay warm and stylish with our men's winter collection.",
            segment: "men",
          },
          {
            title: "Women's Winter Collection",
            description: "Elegant and warm winter wear for women.",
            segment: "women",
          },
        ],
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

const DEFAULT_SECTIONS: [DepartmentSection, DepartmentSection] = [NEW_ARRIVALS, BEST_SELLERS];

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
    sections: override.sections ?? DEFAULT_SECTIONS,
    /*
     * No promo tiles by default. Two empty cards pointing at
     * subcategories that may not exist would be worse than the
     * band simply not being there.
     */
    promos: override.promos ?? [],
  };
}
