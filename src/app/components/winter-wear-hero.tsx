import Link from "next/link";
import { Button } from "@/src/app/components/ui/button";

export function WinterWearHero() {
  return (
    <div className="relative h-[500px] overflow-hidden">
      <img
        src=""
        alt="Winter Wear Collection"
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent">
        <div className="container flex h-full items-center px-4">
          <div className="max-w-lg text-white">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
              Winter Collection
            </h1>
            <p className="mb-6 text-lg">
              Stay warm and stylish with our premium winter wear collection for
              the whole family.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-black hover:bg-gray-100"
              >
                <Link href="#featured-collection">Shop Collection</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Link href="/sale/winter-wear">Shop Sale</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
