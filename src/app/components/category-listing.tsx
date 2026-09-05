import { ProductListing, type ListingSearchParams } from "@/src/app/components/product-listing";
import { fetchCategoriesBySlugs } from "@/src/app/lib/categories";
import { createClient } from "@/src/app/lib/supabase/server";

/*
 * ---------------------------------------------------------
 * CATEGORY LISTING
 * ---------------------------------------------------------
 *
 * /men/[subcategory], /women/[subcategory], /sale/[subcategory]
 * and friends were eight near-identical copies of this page.
 * They now all render this component, so a fix lands once.
 */

export type { ListingSearchParams };

interface CategoryListingProps {
  /* The [subcategory] / [slug] segment from the URL. */
  slug: string;
  /* Breadcrumb parent, omitted for a top-level category page. */
  parent?: { name: string; href: string };
  /*
   * The parent's own slug, used to resolve child slugs that
   * carry the parent as a prefix ("women" + "dresses" ->
   * "women-dresses").
   */
  parentSlug?: string;
  /* Prefix for the heading, e.g. "Women's". */
  titlePrefix?: string;
  /* Restrict to discounted products. */
  sale?: boolean;
  searchParams: ListingSearchParams;
}

interface CategoryRecord {
  name: string;
  description: string | null;
  /* The slug as actually stored, which may differ from the URL. */
  slug: string;
}

/* "winter-coats" -> "Winter Coats" */
const titleFromSlug = (slug: string): string =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/*
 * Resolve a URL segment to a category row.
 *
 * The navigation links to /women/dresses, but seed.sql stores
 * that category as "women-dresses" - the parent name is baked
 * into the child slug. So a segment is looked up both ways:
 * "<parent>-<segment>" first, then the bare "<segment>".
 *
 * Returning the stored slug matters as much as the name: the
 * product grid filters on categories.slug, so it has to be
 * given the slug the database actually holds.
 *
 * `null` means the lookup ran and found nothing; `undefined`
 * means the lookup itself failed, which must not become a 404.
 */
async function getCategory(
  slug: string,
  parentSlug?: string
): Promise<CategoryRecord | null | undefined> {
  try {
    const prefixed = parentSlug ? `${parentSlug}-${slug}` : null;

    const candidates = prefixed ? [prefixed, slug] : [slug];

    const rows = await fetchCategoriesBySlugs(candidates, createClient());

    if (rows.length === 0) {
      return null;
    }

    /* Prefer the parent-scoped slug when both exist. */
    const match =
      (prefixed && rows.find((row) => row.slug === prefixed)) ||
      rows.find((row) => row.slug === slug) ||
      rows[0];

    return {
      name: String(match.name ?? ""),
      description: (match.description as string | null) ?? null,
      slug: String(match.slug ?? slug),
    };
  } catch (error) {
    console.error("Error loading category:", error);
    return undefined;
  }
}

export async function CategoryListing({
  slug,
  parent,
  parentSlug,
  titlePrefix,
  sale,
  searchParams,
}: CategoryListingProps) {
  const category = await getCategory(slug, parentSlug);

  /*
   * The heading falls back to a readable version of the URL
   * segment when the slug isn't in the categories table. It
   * does NOT invent a description - an unknown category just
   * shows an empty product list, which is the truth.
   */
  const name = category?.name ?? titleFromSlug(slug);

  const heading = titlePrefix ? `${titlePrefix} ${name}` : name;

  /*
   * Filter on the stored slug so /women/dresses actually
   * narrows to the "women-dresses" category.
   */
  const filterSlug = category?.slug ?? slug;

  return (
    <ProductListing
      title={heading}
      crumbLabel={name}
      description={category?.description ?? undefined}
      crumbs={parent ? [{ name: parent.name, href: parent.href }] : []}
      categorySlug={filterSlug}
      sale={sale}
      filterCategoryId={slug}
      searchParams={searchParams}
    />
  );
}

/*
 * Metadata helper so each route's generateMetadata stays a
 * one-liner.
 */
export async function buildCategoryMetadata(
  slug: string,
  context: { titlePrefix?: string; parentSlug?: string }
) {
  const category = await getCategory(slug, context.parentSlug);
  const name = category?.name ?? titleFromSlug(slug);

  const title = context.titlePrefix ? `${context.titlePrefix} ${name}` : name;

  return {
    title: `${title} | Lamees`,
    description: category?.description || `Shop ${title.toLowerCase()} at Lamees.`,
  };
}
