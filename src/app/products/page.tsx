import { ProductFilters } from "@/src/app/components/product-filters";
import { ProductGrid } from "@/src/app/components/product-grid";
import { Container } from "@/src/app/components/ui/container";
import Link from "next/link";

export const metadata = {
  title: "Products | Lamees",
  description: "Browse our collection of products",
};

/* Next 15 hands route props in as promises. */
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const readString = (
  value: string | string[] | undefined,
): string | undefined => (typeof value === "string" && value ? value : undefined);

const readNumber = (
  value: string | string[] | undefined,
): number | undefined => {
  const raw = readString(value);

  if (raw === undefined) {
    return undefined;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const category = readString(params.category);
  const sort = readString(params.sort);
  const minPrice = readNumber(params.minPrice);
  const maxPrice = readNumber(params.maxPrice);

  /* ?variants=m,black - matched against product_variants.value */
  const variantValues = readString(params.variants)?.split(",").filter(Boolean);

  return (
    <Container className="py-10 lg:py-14">
      <header className="mb-10 border-b pb-8">
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-foreground">Products</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          All products
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Browse the full catalogue. Narrow it down by price and product
          options, or sort to find what you need faster.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-12">
        {/* Filters travel with the shopper on long lists. */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ProductFilters />
        </aside>

        <div className="min-w-0">
          {/*
            The grid owns the toolbar because only it knows how
            many products the query actually returned.
          */}
          <ProductGrid
            showToolbar
            categorySlug={category}
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
