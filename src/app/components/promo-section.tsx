import Link from "next/link";
import { Button } from "@/src/app/components/ui/button";

export function PromoSection() {
  return (
    <section className="py-12">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-lg bg-gray-900">
          <img
            src=""
            alt="Men's Collection"
            className="h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
            <h3 className="mb-2 text-3xl font-bold">Men's Collection</h3>
            <p className="mb-4 max-w-md">
              Discover our latest men's fashion collection for every occasion.
            </p>
            <Button
              asChild
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              <Link href="/men">Shop Now</Link>
            </Button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-lg bg-gray-900">
          <img
            src=""
            alt="Women's Collection"
            className="h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
            <h3 className="mb-2 text-3xl font-bold">Women's Collection</h3>
            <p className="mb-4 max-w-md">
              Explore our stunning women's fashion collection for every style.
            </p>
            <Button
              asChild
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              <Link href="/women">Shop Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
