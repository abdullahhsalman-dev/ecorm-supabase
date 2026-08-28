"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  RotateCcw,
  Share2,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/src/app/components/cart-provider";
import { Button } from "@/src/app/components/ui/button";
import { Label } from "@/src/app/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/app/components/ui/radio-group";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/app/components/ui/tabs";
import { formatCurrency } from "@/src/app/lib/utils";

interface ProductImage {
  image_url?: string | null;
}

interface ProductCategory {
  slug?: string | null;
  name?: string | null;
}

interface Product {
  id: string | number;
  name?: string | null;
  description?: string | null;
  price?: number | null;
  sale_price?: number | null;
  product_images?: ProductImage[] | null;
  categories?: ProductCategory | null;
}

interface ProductDetailsProps {
  product: Product;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const COLORS = [
  { name: "Black", value: "black", className: "bg-black" },
  { name: "White", value: "white", className: "bg-white" },
  { name: "Navy", value: "navy", className: "bg-[#172554]" },
  { name: "Red", value: "red", className: "bg-red-600" },
];

const FALLBACK_IMAGE = "/placeholder.svg";

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const { addItem } = useCart();
  const { toast } = useToast();

  const productImages = useMemo(() => {
    const images =
      product.product_images
        ?.map((image) => image?.image_url?.trim())
        .filter((image): image is string => Boolean(image)) ?? [];

    return images.length > 0 ? images : [FALLBACK_IMAGE];
  }, [product.product_images]);

  const basePrice = Number(product.price ?? 0);
  const salePrice =
    product.sale_price != null ? Number(product.sale_price) : null;
  const currentPrice =
    salePrice != null && salePrice > 0 && salePrice < basePrice
      ? salePrice
      : basePrice;

  const discountPercentage =
    salePrice != null && basePrice > 0 && salePrice < basePrice
      ? Math.round(((basePrice - salePrice) / basePrice) * 100)
      : 0;

  const categoryName = product.categories?.name;
  const categorySlug = product.categories?.slug;

  useEffect(() => {
    setActiveImage((current) =>
      Math.min(current, Math.max(productImages.length - 1, 0)),
    );
  }, [productImages.length]);

  const showToast = (
    title: string,
    description: string,
    variant?: "default" | "destructive",
  ) => {
    toast({ title, description, variant });
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      showToast(
        "Select your options",
        "Choose a size and color before adding this product to your cart.",
        "destructive",
      );
      return;
    }

    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      name: product.name || "Product",
      price: currentPrice,
      image: productImages[0] || FALLBACK_IMAGE,
      quantity,
    });

    showToast(
      "Added to cart",
      `${product.name || "Product"} has been added to your cart.`,
    );
  };

  const handleShare = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: product.name || "Product",
          text: product.description || "Check out this product.",
          url: window.location.href,
        });
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Link copied", "Product link copied to your clipboard.");
        return;
      }

      showToast("Sharing unavailable", "Copy the page URL from your browser.");
    } catch (error) {
      // navigator.share throws when the user closes the share sheet.
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      showToast(
        "Couldn't share",
        "Please try copying the product URL from your browser.",
        "destructive",
      );
    }
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (event.currentTarget.src.endsWith(FALLBACK_IMAGE)) return;
    event.currentTarget.src = FALLBACK_IMAGE;
  };

  const goToPreviousImage = () => {
    setActiveImage((current) =>
      current === 0 ? productImages.length - 1 : current - 1,
    );
  };

  const goToNextImage = () => {
    setActiveImage((current) => (current + 1) % productImages.length);
  };

  return (
    <section className="w-full">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-start">
        {/* Gallery */}
        <div className="lg:sticky lg:top-6">
          <div className="group relative aspect-square overflow-hidden rounded-3xl border bg-muted/30 shadow-sm">
            <img
              src={productImages[activeImage] || FALLBACK_IMAGE}
              alt={product.name || "Product"}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
              onError={handleImageError}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

            {discountPercentage > 0 && (
              <span className="absolute left-5 top-5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-semibold tracking-wide text-background shadow-lg">
                Save {discountPercentage}%
              </span>
            )}

            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPreviousImage}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background/90 shadow-md backdrop-blur transition hover:scale-105 hover:bg-background"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goToNextImage}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background/90 shadow-md backdrop-blur transition hover:scale-105 hover:bg-background"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 right-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
              {activeImage + 1} / {productImages.length}
            </div>
          </div>

          {productImages.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {productImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`View product image ${index + 1}`}
                  aria-current={activeImage === index}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-muted/30 transition-all duration-200 ${
                    activeImage === index
                      ? "border-foreground shadow-md"
                      : "border-transparent opacity-70 hover:border-border hover:opacity-100"
                  }`}
                >
                  <img
                    src={image || FALLBACK_IMAGE}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={handleImageError}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product information */}
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {categoryName && categorySlug ? (
              <Link
                href={`/categories/${categorySlug}`}
                className="font-medium transition-colors hover:text-foreground hover:underline underline-offset-4"
              >
                {categoryName}
              </Link>
            ) : categoryName ? (
              <span>{categoryName}</span>
            ) : null}

            {categoryName && <span aria-hidden="true">•</span>}
            <span>Premium quality</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {product.name || "Untitled product"}
          </h1>

          <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
            <span className="text-3xl font-bold tracking-tight">
              {formatCurrency(currentPrice)}
            </span>

            {discountPercentage > 0 && (
              <>
                <span className="mb-0.5 text-base text-muted-foreground line-through">
                  {formatCurrency(basePrice)}
                </span>
                <span className="mb-0.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {discountPercentage}% off
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-muted-foreground">
              {product.description}
            </p>
          )}

          <div className="my-7 h-px bg-border" />

          {/* Size */}
          <div className="mb-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Size</h2>
              <span className="text-xs text-muted-foreground">
                {selectedSize ? `Selected: ${selectedSize}` : "Choose a size"}
              </span>
            </div>

            <RadioGroup
              value={selectedSize}
              onValueChange={setSelectedSize}
              className="flex flex-wrap gap-2"
              aria-label="Select size"
            >
              {SIZES.map((size) => (
                <div key={size}>
                  <RadioGroupItem
                    value={size}
                    id={`size-${product.id}-${size}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`size-${product.id}-${size}`}
                    className="flex h-11 min-w-12 cursor-pointer items-center justify-center rounded-xl border px-4 text-sm font-medium transition-all hover:border-foreground/50 peer-data-[state=checked]:border-foreground peer-data-[state=checked]:bg-foreground peer-data-[state=checked]:text-background"
                  >
                    {size}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Color */}
          <div className="mb-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Color</h2>
              <span className="text-xs text-muted-foreground">
                {selectedColor
                  ? `Selected: ${
                      COLORS.find((color) => color.value === selectedColor)
                        ?.name
                    }`
                  : "Choose a color"}
              </span>
            </div>

            <RadioGroup
              value={selectedColor}
              onValueChange={setSelectedColor}
              className="flex flex-wrap gap-3"
              aria-label="Select color"
            >
              {COLORS.map((color) => (
                <div key={color.value}>
                  <RadioGroupItem
                    value={color.value}
                    id={`color-${product.id}-${color.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`color-${product.id}-${color.value}`}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-all hover:border-foreground/50 peer-data-[state=checked]:border-foreground peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className={`h-5 w-5 rounded-full border border-black/10 shadow-sm ${color.className}`}
                    />
                    <span>{color.name}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Quantity + actions */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex h-12 w-full items-center rounded-xl border bg-background sm:w-auto">
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="flex h-full w-12 items-center justify-center rounded-l-xl text-lg transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                −
              </button>
              <span
                aria-live="polite"
                className="flex h-full w-10 items-center justify-center border-x text-sm font-semibold"
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.min(99, current + 1))
                }
                disabled={quantity >= 99}
                aria-label="Increase quantity"
                className="flex h-full w-12 items-center justify-center rounded-r-xl text-lg transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>

            <Button
              onClick={handleAddToCart}
              className="h-12 flex-1 rounded-xl text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Add to cart
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsFavorite((current) => !current)}
              aria-label={
                isFavorite ? "Remove from wishlist" : "Add to wishlist"
              }
              aria-pressed={isFavorite}
              className="h-12 w-12 shrink-0 rounded-xl"
            >
              <Heart
                className={`h-5 w-5 transition ${
                  isFavorite ? "fill-current" : ""
                }`}
              />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleShare}
              aria-label="Share product"
              className="h-12 w-12 shrink-0 rounded-xl"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <p className="mb-7 text-xs text-muted-foreground">
            Select a size and color to add this product to your cart.
          </p>

          {/* Service highlights */}
          <div className="grid overflow-hidden rounded-2xl border bg-muted/20 sm:grid-cols-3">
            <div className="flex items-center gap-3 border-b p-4 sm:border-b-0 sm:border-r">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background shadow-sm">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Free shipping</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Orders over Rs. 5,000
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-b p-4 sm:border-b-0 sm:border-r">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Easy returns</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  30-day returns
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background shadow-sm">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Authentic</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  100% genuine products
                </p>
              </div>
            </div>
          </div>

          {/* Product tabs */}
          <Tabs defaultValue="description" className="mt-8">
            <TabsList className="grid h-11 w-full grid-cols-3 rounded-xl bg-muted p-1">
              <TabsTrigger
                value="description"
                className="rounded-lg text-xs sm:text-sm"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-lg text-xs sm:text-sm"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="rounded-lg text-xs sm:text-sm"
              >
                Shipping
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="description"
              className="mt-5 text-sm leading-7 text-muted-foreground"
            >
              <p>{product.description || "No description available."}</p>
            </TabsContent>

            <TabsContent value="details" className="mt-5">
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Material: 100% Cotton",
                  "Fit: Regular fit",
                  "Care: Machine wash cold",
                  "Imported",
                ].map((detail) => (
                  <li key={detail} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {detail}
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent
              value="shipping"
              className="mt-5 text-sm leading-7 text-muted-foreground"
            >
              <p>
                Standard delivery: 3–5 business days
                <br />
                Express delivery: 1–2 business days
                <br />
                Free shipping on orders over Rs. 5,000
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
