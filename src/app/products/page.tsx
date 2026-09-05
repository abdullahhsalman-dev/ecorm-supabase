import {
  ProductListing,
  readString,
  type ListingSearchParams,
} from "@/src/app/components/product-listing";
import Link from "next/link";

export const metadata = {
  title: "Stitched Dresses Online in Pakistan - Shop All Ready to Wear",
  description:
    "Browse every stitched dress in the collection. Ready to wear eastern wear for women in " +
    "Pakistan - lawn, cotton, chiffon, formal and party wear - filtered by price, size and colour.",
  alternates: { canonical: "/products" },
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
