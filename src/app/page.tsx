import { HeroSection } from "@/src/app/components/hero-section";
import { FeaturedProducts } from "@/src/app/components/featured-products";
import { CategoryShowcase } from "@/src/app/components//category-showcase";
import { PromoSection } from "@/src/app/components/promo-section";
import { Newsletter } from "@/src/app/components//newsletter";

export default async function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <PromoSection />
      <Newsletter />
    </div>
  );
}
