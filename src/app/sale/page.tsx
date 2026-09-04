import { ProductGrid } from "@/src/app/components/product-grid";
import { SaleBanner } from "@/src/app/components/sale-banner";
import { SaleCategories } from "@/src/app/components/sale-categories";
import { Skeleton } from "@/src/app/components/ui/skeleton";
import { Suspense } from "react";

/*
 * "Sale" and "with price" attach to almost every commercial
 * phrase in the Pakistani corpus, so this page leads with the
 * discount and the word "stitched" rather than a campaign name
 * nobody searches for.
 */
export const metadata = {
  title: "Stitched Dress Sale - Ready to Wear Dresses on Sale in Pakistan",
  description:
    "Stitched dresses on sale in Pakistan. Ready to wear lawn suits, kurtis and party wear " +
    "reduced, with every price shown in the listing. Fully stitched - no unstitched fabric.",
  alternates: { canonical: "/sale" },
};

export default function SalePage() {
  return (
    <div className="px-4 py-8">
      <SaleBanner />

      <div className="my-12">
        <h2 className="mb-8 text-center text-3xl font-bold">Shop Sale by Category</h2>
        <SaleCategories />
      </div>

      <div className="my-12" id="sale-products">
        <h2 className="mb-8 text-3xl font-bold">Featured Sale Items</h2>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array(8)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
            </div>
          }
        >
          <ProductGrid sale={true} sort="discount-desc" />
        </Suspense>
      </div>

      <div className="my-12 rounded-lg bg-red-50 p-8 text-center">
        <h3 className="mb-4 text-2xl font-bold text-red-700">Limited Time Offer</h3>
        <p className="mb-6 text-lg text-red-600">
          Use code <span className="font-bold">FESTIVE25</span> at checkout for an extra 10% off
          sale items!
        </p>
        <p className="text-sm text-red-500">
          Offer valid until stock lasts. Cannot be combined with other promotions.
        </p>
      </div>
    </div>
  );
}
