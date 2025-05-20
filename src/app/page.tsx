import { HeroSection } from "@/components/hero-section";
import { FeaturedProducts } from "@/components/featured-products";
import { CategoryShowcase } from "@/components/category-showcase";
import { PromoSection } from "@/components/promo-section";
import { Newsletter } from "@/components/newsletter";

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
