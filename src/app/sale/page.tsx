import { ProductListing } from "@/src/app/components/product-listing";
import { SaleCategories } from "@/src/app/components/sale-categories";
import { Container } from "@/src/app/components/ui/container";
import type { ListingSearchParams } from "@/src/app/components/product-listing";

/*
 * "Sale" and "with price" attach to almost every commercial
 * phrase in the Pakistani corpus, so this page leads with the
 * discount and the word "stitched" rather than a campaign name
 * nobody searches for.
 */
export const metadata = {
  title: "Grand Festive Sale | Lamees",
  description: "Shop our exclusive sale with up to 50% off on selected items",
};

/* Next 15 hands route props in as promises. */
type SearchParams = Promise<ListingSearchParams>;

export default async function SalePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  return (
    <>
      <Container className="py-8">
        <div className="mt-12">
          <h2 className="mb-8 text-center text-3xl font-bold">Shop Sale by Category</h2>

          <SaleCategories />
        </div>
      </Container>

      {/*
        The same listing every other product page renders, with
        the sale filter fixed on. It used to be a bare grid with
        no filters and no toolbar, which left the one page where
        narrowing matters most as the only one that could not.

        The banner's "Shop now" jumps to #sale-products, so the
        anchor stays where the grid is.
      */}
      <ProductListing
        id="sale-products"
        title="All sale products"
        headingAs="h2"
        showBreadcrumb={false}
        description="Every reduced line across the store, biggest discounts first. Narrow by price and product options, or sort to find what you need faster."
        sale
        defaultSort="discount-desc"
        searchParams={params}
      />
    </>
  );
}
