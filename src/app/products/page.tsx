import {
  ProductListing,
  readString,
  type ListingSearchParams,
} from "@/src/app/components/product-listing";
import Link from "next/link";

export const metadata = {
  title: "Products | Lamees",
  description: "Browse our collection of products",
};

/* Next 15 hands route props in as promises. */
type SearchParams = Promise<ListingSearchParams>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  /* ?q=polo - the header search box. */
  const search = readString(params.q);

  return (
    <ProductListing
      title={search ? `Results for "${search}"` : "All products"}
      description={
        search
          ? "Matching products from the catalogue. Narrow them down further by price and product options."
          : "Browse the full catalogue. Narrow it down by price and product options, or sort to find what you need faster."
      }
      crumbs={search ? [{ name: "Products", href: "/products" }] : []}
      crumbLabel={search ? "Search" : "Products"}
      search={search}
      searchParams={params}
      headerExtra={
        search ? (
          <Link
            href="/products"
            className="mt-3 inline-block text-xs underline underline-offset-4 hover:no-underline"
          >
            Clear search
          </Link>
        ) : null
      }
    />
  );
}
