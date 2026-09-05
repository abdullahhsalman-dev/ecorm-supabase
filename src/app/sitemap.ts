import { RESERVED_SLUGS } from "@/src/app/lib/departments";
import { childSegment } from "@/src/app/lib/navigation";
import { absoluteUrl } from "@/src/app/lib/seo";
import { createClient } from "@/src/app/lib/supabase/server";
import type { MetadataRoute } from "next";

/*
 * ---------------------------------------------------------
 * sitemap.xml
 * ---------------------------------------------------------
 *
 * Everything a crawler should reach, built from the database
 * rather than from a list kept by hand: the fixed routes, every
 * department, every subcategory beneath it, and every product.
 * A category added in the admin this morning is in the sitemap
 * on the next revalidate, with no deploy.
 *
 * Only public routes appear. The account, cart, checkout and
 * admin screens are excluded here as well as in robots.ts -
 * listing a URL in a sitemap while disallowing it in robots is
 * a contradiction Search Console reports as an error.
 *
 * A database that will not answer must not fail the build: the
 * catch below degrades to the static routes rather than
 * throwing, so a deploy still produces a valid sitemap.
 */

/* Rebuilt on the same cadence as the department pages. */
export const revalidate = 300;

type CategoryRow = {
  id: string;
  slug: string;
  parent_id: string | null;
  updated_at: string | null;
};

type ProductRow = { slug: string; updated_at: string | null };

const toDate = (value: string | null): Date => (value ? new Date(value) : new Date());

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/products"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/sale"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/new-arrivals"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const supabase = createClient();

    const [categories, products] = await Promise.all([
      supabase.from("categories").select("id, slug, parent_id, updated_at"),
      supabase.from("products").select("slug, updated_at"),
    ]);

    const rows = (categories.data ?? []) as CategoryRow[];

    /* Children are addressed as /<department>/<subcategory>. */
    const slugById = new Map(rows.map((row) => [row.id, row.slug]));

    const departments = rows.filter(
      (row) => !row.parent_id && row.slug && !RESERVED_SLUGS.has(row.slug)
    );

    const departmentRoutes: MetadataRoute.Sitemap = departments.map((row) => ({
      url: absoluteUrl(`/${row.slug}`),
      lastModified: toDate(row.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const subcategoryRoutes: MetadataRoute.Sitemap = rows
      .filter((row) => row.parent_id && row.slug)
      .map((row) => {
        const parent = slugById.get(row.parent_id as string);

        /*
         * A child whose parent is missing, or whose parent is
         * itself a child, has no department URL to sit under.
         */
        if (!parent || RESERVED_SLUGS.has(parent)) {
          return null;
        }

        /*
         * Child slugs carry the parent as a prefix
         * ("men-t-shirts") but the route does not
         * (/men/t-shirts). Both resolve, so emitting the stored
         * slug here would advertise a second URL for a page the
         * navigation already links to under its short one -
         * duplicate content, self-inflicted.
         */
        return {
          url: absoluteUrl(`/${parent}/${childSegment(row.slug, parent)}`),
          lastModified: toDate(row.updated_at),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        };
      })
      .filter((route): route is NonNullable<typeof route> => route !== null);

    const productRoutes: MetadataRoute.Sitemap = ((products.data ?? []) as ProductRow[])
      .filter((row) => Boolean(row.slug))
      .map((row) => ({
        url: absoluteUrl(`/products/${row.slug}`),
        lastModified: toDate(row.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));

    return [...staticRoutes, ...departmentRoutes, ...subcategoryRoutes, ...productRoutes];
  } catch (error) {
    console.error("Sitemap could not read the catalogue:", error);

    return staticRoutes;
  }
}
