"use client";

import { useCart } from "@/src/app/components/cart-provider";
import { Button } from "@/src/app/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  getDiscountPercent,
  getEffectivePrice,
  getPrimaryImage,
  hasDiscount,
  isInStock,
  type StorefrontProduct,
} from "@/src/app/lib/products";
import { cn, formatCurrency, safeImageSrc } from "@/src/app/lib/utils";
import { Heart, ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductCardProps {
  product: StorefrontProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { addItem } = useCart();
  const { toast } = useToast();

  const primaryImage = getPrimaryImage(product);
  const secondaryImage = product.product_images[1]?.image_url ?? null;

  /* Swap to the second shot on hover, when there is one. */
  const displayImage = (isHovered && secondaryImage) || primaryImage;

  const price = getEffectivePrice(product);
  const discountPercentage = getDiscountPercent(product);
  const inStock = isInStock(product);

  /*
   * A product with variants has to be configured on its own
   * page, so the card links through instead of adding an
   * unconfigured item to the cart.
   */
  const needsVariantSelection = product.product_variants.length > 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      productId: product.id,
      variantIds: [],
      name: product.name,
      price,
      image: primaryImage ?? "",
      quantity: 1,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="group flex flex-col">
      {/* Media */}
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          {displayImage ? (
            <Image
              src={safeImageSrc(displayImage)}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className={cn(
                "object-cover transition-transform duration-500 ease-out",
                inStock ? "group-hover:scale-[1.04]" : "opacity-60",
              )}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
              <ImageOff className="h-7 w-7 text-muted-foreground/40" />
              <span className="text-[11px] text-muted-foreground/60">
                No image
              </span>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {discountPercentage > 0 && (
            <span className="rounded-full bg-[#FF3D6E] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              {discountPercentage}% off
            </span>
          )}

          {product.featured && discountPercentage === 0 && (
            <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={() => setIsFavorite((current) => !current)}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isFavorite}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm backdrop-blur transition-all hover:bg-white hover:text-[#FF3D6E] focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current text-[#FF3D6E]")} />
        </button>

        {!inStock && (
          <div className="absolute inset-x-0 bottom-0 bg-neutral-900/85 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
            Out of stock
          </div>
        )}
      </div>

      {/* Details */}
      <div className="mt-3.5 flex flex-1 flex-col">
        {product.categories?.name && (
          <span className="mb-1 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            {product.categories.name}
          </span>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-foreground/70">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[15px] font-semibold tracking-tight">
            {formatCurrency(price)}
          </span>

          {hasDiscount(product) && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        <div className="mt-3.5">
          {!inStock ? (
            <Button size="sm" className="w-full rounded-full" disabled>
              Out of stock
            </Button>
          ) : needsVariantSelection ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-full"
              asChild
            >
              <Link href={`/products/${product.slug}`}>Select options</Link>
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full rounded-full"
              onClick={handleAddToCart}
            >
              Add to cart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
