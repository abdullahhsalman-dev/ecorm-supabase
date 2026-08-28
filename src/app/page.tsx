import { CategoryShowcase } from "@/src/app/components//category-showcase";
import { Newsletter } from "@/src/app/components//newsletter";
import { FeaturedProducts } from "@/src/app/components/featured-products";
import { HeroSection } from "@/src/app/components/hero-section";
import { PromoSection } from "@/src/app/components/promo-section";

export default async function Home() {
  return (
    <div className=" mx-auto px-4 py-8">
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <PromoSection />
      <Newsletter />
    </div>
  );
}
