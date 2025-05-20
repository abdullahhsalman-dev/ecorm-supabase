"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";

export function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id, 
          name, 
          slug, 
          price, 
          sale_price,
          product_images(image_url, is_primary)
        `
        )
        .eq("featured", true)
        .limit(8);

      if (error) {
        console.error("Error fetching featured products:", error);
        return;
      }

      setProducts(data || []);
      setLoading(false);
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg bg-gray-200 p-4">
              <div className="mb-4 aspect-square rounded bg-gray-300"></div>
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-300"></div>
              <div className="h-4 w-1/2 rounded bg-gray-300"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
        <Link
          href="/products"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all products
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button asChild variant="outline">
          <Link href="/products">View All Products</Link>
        </Button>
      </div>
    </section>
  );
}
