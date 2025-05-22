"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/src/app/components/ui/button";
import { createClient } from "@/src/app/lib/supabase/client";
import { useAuth } from "@/src/app/components/auth-provider";
import { useCart } from "@/src/app/components/cart-provider";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/src/app/lib/utils";
import { getDummyWishlistItems } from "@/src/app/lib/dummy-data";

export function AccountWishlist() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      if (!user) {
        // Use dummy data if no user
        setWishlistItems(getDummyWishlistItems());
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: wishlist, error: wishlistError } = await supabase
          .from("wishlists")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (wishlistError && wishlistError.code !== "PGRST116") {
          console.error("Error fetching wishlist:", wishlistError);
          // Use dummy data on error
          setWishlistItems(getDummyWishlistItems());
          setLoading(false);
          return;
        }

        if (!wishlist) {
          // No wishlist found, use dummy data
          setWishlistItems(getDummyWishlistItems());
          setLoading(false);
          return;
        }

        // Fetch wishlist items with product details
        const { data: items, error: itemsError } = await supabase
          .from("wishlist_items")
          .select(
            `
            id,
            product_id,
            products:product_id (
              id,
              name,
              slug,
              price,
              sale_price,
              product_images (
                image_url,
                is_primary
              )
            )
          `
          )
          .eq("wishlist_id", wishlist.id);

        if (itemsError) {
          console.error("Error fetching wishlist items:", itemsError);
          // Use dummy data on error
          setWishlistItems(getDummyWishlistItems());
          setLoading(false);
          return;
        }

        if (items && items.length > 0) {
          setWishlistItems(items);
        } else {
          // No items found, use dummy data
          setWishlistItems(getDummyWishlistItems());
        }
      } catch (error) {
        console.error("Error in fetchWishlist:", error);
        // Use dummy data on error
        setWishlistItems(getDummyWishlistItems());
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, [user]);

  const handleRemoveFromWishlist = async (
    itemId: string,
    productName: string
  ) => {
    // Remove the item from the local state
    setWishlistItems((prev) => prev.filter((item: any) => item.id !== itemId));

    toast({
      title: "Item removed",
      description: `${productName} has been removed from your wishlist.`,
    });

    // If user is logged in, also remove from database
    if (user) {
      const supabase = createClient();
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        console.error("Error removing item from wishlist:", error);
        toast({
          title: "Error",
          description: "Failed to remove item from wishlist.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddToCart = (product: any) => {
    const primaryImage =
      product.product_images.find((img: any) => img.is_primary)?.image_url ||
      product.product_images[0]?.image_url ||
      "/placeholder.svg";

    addItem({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: primaryImage,
      quantity: 1,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {Array(3)
          .fill(null)
          .map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border bg-card p-4"
            >
              <div className="mb-4 aspect-square rounded bg-muted"></div>
              <div className="mb-2 h-4 w-3/4 rounded bg-muted"></div>
              <div className="h-4 w-1/2 rounded bg-muted"></div>
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Your Wishlist</h3>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {wishlistItems.map((item: any) => {
          const product = item.products;
          const primaryImage =
            product.product_images.find((img: any) => img.is_primary)
              ?.image_url ||
            product.product_images[0]?.image_url ||
            "/placeholder.svg";

          return (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border bg-card"
            >
              <div className="relative aspect-square overflow-hidden">
                <Link href={`/products/${product.slug}`}>
                  <img
                    src={primaryImage || ""}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                {product.sale_price && (
                  <div className="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                    {Math.round(
                      ((product.price - product.sale_price) / product.price) *
                        100
                    )}
                    % OFF
                  </div>
                )}
              </div>
              <div className="p-4">
                <Link href={`/products/${product.slug}`}>
                  <h4 className="mb-1 font-medium">{product.name}</h4>
                </Link>
                <div className="mb-4 flex items-center">
                  {product.sale_price ? (
                    <>
                      <span className="font-semibold">
                        {formatCurrency(product.sale_price)}
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground line-through">
                        {formatCurrency(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleRemoveFromWishlist(item.id, product.name)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
