"use client";

import { ProductCard } from "@/src/app/components/product-card";
import { Button } from "@/src/app/components/ui/button";
import {
  Container,
  Section,
  SectionHeading,
} from "@/src/app/components/ui/container";
import { Skeleton } from "@/src/app/components/ui/skeleton";
import { useProductList } from "@/src/app/lib/use-product-list";
import Link from "next/link";

export function FeaturedProducts() {
  const { products, loading } = useProductList({
    featured: true,
    sort: "newest",
    limit: 8,
    label: "featured products",
  });

  if (loading) {
    return (
      <Section className="bg-muted/30">
        <Container>
          <SectionHeading
            eyebrow="Handpicked"
            title="Featured products"
            description="A rotating edit of pieces worth a closer look."
          />

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
            ))}
          </div>
        </Container>
      </Section>
    );
  }

  /*
   * Nothing is featured yet - hide the section rather than
   * leaving a heading over an empty grid.
   */
  if (products.length === 0) {
    return null;
  }

  return (
    <Section className="bg-muted/30">
      <Container>
        <SectionHeading
          eyebrow="Handpicked"
          title="Featured products"
          description="A rotating edit of pieces worth a closer look."
          actionHref="/products"
          actionLabel="View all products"
        />

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link href="/products">View all products</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
