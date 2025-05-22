"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/src/app/components/product-card";
import { createClient } from "@/src/app/lib/supabase/client";
import { generateDummyProducts } from "@/src/app/lib/dummy-data";

interface ProductGridProps {
  categorySlug?: string;
  categoryId?: string;
  sale?: boolean;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}

export function ProductGrid({
  categorySlug,
  categoryId,
  sale,
  sort,
  minPrice,
  maxPrice,
  limit = 24,
}: ProductGridProps) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const supabase = createClient();

      try {
        let query = supabase.from("products").select(`
            id, 
            name, 
            slug, 
            price, 
            sale_price,
            product_images(image_url, is_primary),
            categories:category_id(slug)
          `);

        // Apply filters
        if (categorySlug) {
          // For main categories (men, women, kids, etc.)
          if (
            [
              "men",
              "women",
              "kids",
              "footwear",
              "fragrance",
              "winter-wear",
            ].includes(categorySlug)
          ) {
            // Filter by parent category
            query = query.eq("categories.slug", categorySlug);
          }
          // For subcategories
          else {
            // Just filter by the subcategory slug
            query = query.eq("categories.slug", categorySlug);
          }
        }

        // If categoryId is provided (not undefined), use it for filtering
        if (categoryId) {
          query = query.eq("category_id", categoryId);
        }

        if (sale) {
          query = query.not("sale_price", "is", null);
        }

        if (minPrice !== undefined) {
          query = query.gte("price", minPrice);
        }

        if (maxPrice !== undefined) {
          query = query.lte("price", maxPrice);
        }

        // Apply sorting
        if (sort) {
          switch (sort) {
            case "price-asc":
              query = query.order("price", { ascending: true });
              break;
            case "price-desc":
              query = query.order("price", { ascending: false });
              break;
            case "newest":
              query = query.order("created_at", { ascending: false });
              break;
            case "discount-desc":
              query = query
                .not("sale_price", "is", null)
                .order("sale_price", { ascending: true });
              break;
            case "best-selling":
              query = query.order("id", { ascending: false });
              break;
            case "trending":
              query = query.order("id", { ascending: true });
              break;
            default:
              query = query.order("name", { ascending: true });
          }
        } else {
          query = query.order("name", { ascending: true });
        }

        const { data, error } = await query.limit(limit);

        if (error) {
          console.error("Error fetching products:", error);
          // Use dummy data on error
          const dummyData = generateDummyProducts(
            categorySlug || "products",
            limit
          );
          setProducts(dummyData);
          return;
        }

        if (data && data.length > 0) {
          setProducts(data);
        } else {
          // No data found, use dummy data
          const dummyData = generateDummyProducts(
            categorySlug || "products",
            limit
          );
          setProducts(dummyData);
        }
      } catch (error) {
        console.error("Error in fetchProducts:", error);
        // Use dummy data on error
        const dummyData = generateDummyProducts(
          categorySlug || "products",
          limit
        );
        setProducts(dummyData);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [categorySlug, categoryId, sale, sort, minPrice, maxPrice, limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array(limit > 4 ? 4 : limit)
          .fill(null)
          .map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg bg-gray-200 p-4">
              <div className="mb-4 aspect-square rounded bg-gray-300"></div>
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-300"></div>
              <div className="h-4 w-1/2 rounded bg-gray-300"></div>
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
