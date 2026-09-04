import { CategoryShowcase } from "@/src/app/components/category-showcase";
import { FeaturedProducts } from "@/src/app/components/featured-products";
import { HeroSection } from "@/src/app/components/hero-section";
import { PromoSection } from "@/src/app/components/promo-section";
import type { Metadata } from "next";

/*
 * The title and description come from the layout's defaults;
 * only the canonical is set here, because a canonical on the
 * layout would be inherited by every other route.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

/*
 * CategoryShowcase reads the categories table, so this page goes
 * stale the same way the department pages do without a rebuild.
 */
export const revalidate = 300;

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
      <PromoSection />

      {/*
        The newsletter sign-up lives in the footer on every
        page, so the homepage no longer repeats it.
      */}
    </>
  );
}
