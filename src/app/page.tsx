import { CategoryShowcase } from "@/src/app/components/category-showcase";
import { FeaturedPicks } from "@/src/app/components/featured-picks";
import { FeaturedProducts } from "@/src/app/components/featured-products";
import { HeroSection } from "@/src/app/components/hero-section";

/*
 * Nothing on this page is read on the server any more - the
 * categories come from the shared store and the products from
 * the client - so there is nothing here to revalidate.
 */

export default function Home() {
  return (
    <>
      {/*
        Each section carries its own spacing and hides itself
        when it has nothing to show, so an empty catalogue
        leaves no blank bands behind.
      */}
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <FeaturedPicks />

      {/*
        The newsletter sign-up lives in the footer on every
        page, so the homepage no longer repeats it.
      */}
    </>
  );
}
