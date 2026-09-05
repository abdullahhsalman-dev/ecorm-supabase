import { ProductListing, type ListingSearchParams } from "@/src/app/components/product-listing";
import { NEW_ARRIVAL_MONTHS } from "@/src/app/lib/products";

export const metadata = {
  title: "New Arrivals | Lamees",
  description: "Explore the latest products in our store",
};

/*
 * "Newest first" is an ordering, not a filter, so this page
 * used to list the entire catalogue - the oldest product in
 * the shop was a new arrival, it was simply last. A product
 * is new here if it was added in the last NEW_ARRIVAL_MONTHS.
 */

/* Next 15 hands route props in as promises. */
type SearchParams = Promise<ListingSearchParams>;

export default async function NewArrivalsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  return (
    <ProductListing
      title="New Arrivals"
      crumbLabel="New In"
      description={`Everything added in the last ${NEW_ARRIVAL_MONTHS} months, newest first. Narrow by price and product options, or sort to find what you need faster.`}
      defaultSort="newest"
      newWithinMonths={NEW_ARRIVAL_MONTHS}
      searchParams={params}
    />
  );
}
