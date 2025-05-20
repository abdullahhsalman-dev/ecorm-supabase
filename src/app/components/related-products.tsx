"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { createClient } from "@/lib/supabase/client";
import { generateDummyProducts } from "@/lib/dummy-data";

interface RelatedProductsProps {
  currentProductId: string;
  categoryId: string;
}

export function RelatedProducts({
  currentProductId,
  categoryId,
}: RelatedProductsProps) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedProducts() {
      const supabase = createClient();

      try {
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
          .eq("category_id", categoryId)
          .neq("id", currentProductId)
          .limit(4);

        if (error) {
          console.error("Error fetching related products:", error);
          // Use dummy data on error
          const dummyData = generateDummyProducts(categoryId, 4);
          setProducts(dummyData);
          return;
        }

        if (data && data.length > 0) {
          setProducts(data);
        } else {
          // No data found, use dummy data
          const dummyData = generateDummyProducts(categoryId, 4);
          setProducts(dummyData);
        }
      } catch (error) {
        console.error("Error in fetchRelatedProducts:", error);
        // Use dummy data on error
        const dummyData = generateDummyProducts(categoryId, 4);
        setProducts(dummyData);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedProducts();
  }, [currentProductId, categoryId]);

  if (loading) {
    return (
      <section className="py-12">
        <h2 className="mb-8 text-2xl font-bold">Related Products</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {Array(4)
            .fill(null)
            .map((_, i) => (
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
      <h2 className="mb-8 text-2xl font-bold">Related Products</h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
