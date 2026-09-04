import { ProductFilters } from "@/src/app/components/product-filters";
import { ProductGrid } from "@/src/app/components/product-grid";
import { Container } from "@/src/app/components/ui/container";
import { fetchCategoriesBySlugs } from "@/src/app/lib/categories";
import { childSegment } from "@/src/app/lib/navigation";
import { createClient } from "@/src/app/lib/supabase/server";
import Link from "next/link";

/*
 * ---------------------------------------------------------
 * CATEGORY LISTING
 * ---------------------------------------------------------
 *
 * /men/[subcategory], /women/[subcategory], /sale/[subcategory]
 * and friends were eight near-identical copies of this page.
 * They now all render this component, so a fix lands once.
 */

export type ListingSearchParams = Record<string, string | string[] | undefined>;

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

const readString = (value: string | string[] | undefined): string | undefined =>
  typeof value === "string" && value ? value : undefined;

const readNumber = (value: string | string[] | undefined): number | undefined => {
  const raw = readString(value);

  if (raw === undefined) {
    return undefined;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

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

  /* Filters live in the URL, so this page has to read them. */
  const sort = readString(searchParams.sort);
  const minPrice = readNumber(searchParams.minPrice);
  const maxPrice = readNumber(searchParams.maxPrice);
  const variantValues = readString(searchParams.variants)?.split(",").filter(Boolean);

  return (
    <Container className="py-10 lg:py-14">
      <header className="mb-10 border-b pb-8">
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
            </li>

            {parent && (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href={parent.href} className="transition-colors hover:text-foreground">
                    {parent.name}
                  </Link>
                </li>
              </>
            )}

            <li aria-hidden="true">/</li>
            <li className="font-medium text-foreground">{name}</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h1>

        {category?.description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {category.description}
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-12">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ProductFilters categoryId={slug} />
        </aside>

        <div className="min-w-0">
          <ProductGrid
            showToolbar
            categorySlug={filterSlug}
            sale={sale}
            sort={sort}
            minPrice={minPrice}
            maxPrice={maxPrice}
            variantValues={variantValues}
          />
        </div>
      </div>
    </Container>
  );
}

/*
 * Metadata helper so each route's generateMetadata stays a
 * one-liner.
 */
export async function buildCategoryMetadata(
  slug: string,
  context: {
    parentSlug?: string;
    /* The section this page sits under, e.g. "/women" or "/sale". */
    basePath: string;
    /* A /sale/[subcategory] page reads as "Women Sale", not
     * "Stitched Women", so the two shapes are named apart. */
    variant?: "category" | "sale";
  }
) {
  const category = await getCategory(slug, context.parentSlug);
  const name = category?.name ?? titleFromSlug(slug);

  /*
   * Both /men/t-shirts and /men/men-t-shirts resolve, because a
   * child slug stores the parent as a prefix and getCategory
   * accepts either. The short form is the one the navigation
   * links to, so it is the one every page here declares as
   * canonical - otherwise the two spellings compete.
   */
  const segment = context.parentSlug
    ? childSegment(category?.slug ?? slug, context.parentSlug)
    : (category?.slug ?? slug);

  const canonical = `${context.basePath}/${segment}`;

  /*
   * "Stitched" and "ready to wear" are what a Pakistani shopper
   * types; "pret" is trade jargon that autocompletes to a
   * sandwich chain. Saying "stitched" out loud is also what
   * keeps unstitched-fabric traffic away, so it belongs in the
   * title rather than only in the body copy.
   */
  const title =
    context.variant === "sale"
      ? `${name} Sale - Stitched Dresses on Sale in Pakistan`
      : `Stitched ${name} - Ready to Wear in Pakistan`;

  const description =
    category?.description ||
    `Shop stitched, ready to wear ${name.toLowerCase()} in Pakistan. ` +
      `Sold fully stitched with prices shown - never unstitched fabric.`;

  return {
    title,
    description,
    /* Without its own, it inherits the homepage's canonical. */
    alternates: { canonical },
    openGraph: {
      type: "website" as const,
      title,
      description,
      url: canonical,
    },
  };
}
