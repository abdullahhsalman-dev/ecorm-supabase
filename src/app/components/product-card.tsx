"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/src/app/components/ui/button";
import { useCart } from "@/src/app/components/cart-provider";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/src/app/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    product_images: Array<{
      image_url: string;
      is_primary: boolean;
    }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  const primaryImage =
    product.product_images.find((img) => img.is_primary)?.image_url ||
    product.product_images[0]?.image_url ||
    "";

  const secondaryImage = product.product_images[1]?.image_url || primaryImage;

  const displayImage = isHovered ? secondaryImage : primaryImage;

  const handleAddToCart = () => {
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

  const discountPercentage = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background p-2">
      <div
        className="relative aspect-square overflow-hidden rounded-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/products/${product.slug}`}>
          <img
            src={displayImage || ""}
            alt={product.name}
            className="h-full w-full object-cover transition-all group-hover:scale-105"
          />
        </Link>
        {discountPercentage > 0 && (
          <div className="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
            {discountPercentage}% OFF
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 text-muted-foreground hover:bg-white hover:text-primary"
        >
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </div>
      <div className="mt-4 space-y-2 px-1">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2">
          {product.sale_price ? (
            <>
              <span className="font-semibold">
                {formatCurrency(product.sale_price)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.price)}
              </span>
            </>
          ) : (
            <span className="font-semibold">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
        <Button size="sm" className="w-full" onClick={handleAddToCart}>
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
