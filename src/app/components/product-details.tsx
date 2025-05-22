"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Share2, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/src/app/components/ui/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/app/components/ui/radio-group";
import { Label } from "@/src/app/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/app/components/ui/tabs";
import { useCart } from "@/src/app/components/cart-provider";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/src/app/lib/utils";

interface ProductDetailsProps {
  product: any; // In a real app, we would define a proper type
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast({
        title: "Please select options",
        description: "Please select a size and color before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.product_images[0]?.image_url || "",
      quantity,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // Mock data for sizes and colors
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = [
    { name: "Black", value: "black" },
    { name: "White", value: "white" },
    { name: "Navy", value: "navy" },
    { name: "Red", value: "red" },
  ];

  const productImages = product.product_images.map(
    (img: any) => img.image_url
  ) || ["/placeholder.svg"];

  const discountPercentage = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <img
            src={productImages[activeImage] || ""}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          {discountPercentage > 0 && (
            <div className="absolute left-4 top-4 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
              {discountPercentage}% OFF
            </div>
          )}
        </div>
        <div className="flex space-x-2 overflow-x-auto">
          {productImages.map((image: string, index: number) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`relative aspect-square w-20 overflow-hidden rounded-md border-2 ${
                activeImage === index ? "border-primary" : "border-transparent"
              }`}
            >
              <img
                src={image || ""}
                alt={`${product.name} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div>
        <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
        <p className="mb-4 text-muted-foreground">
          Category:{" "}
          <Link
            href={`/categories/${product.categories?.slug}`}
            className="hover:underline"
          >
            {product.categories?.name}
          </Link>
        </p>

        <div className="mb-6 flex items-center">
          {product.sale_price ? (
            <>
              <span className="text-2xl font-bold">
                {formatCurrency(product.sale_price)}
              </span>
              <span className="ml-2 text-muted-foreground line-through">
                {formatCurrency(product.price)}
              </span>
              <span className="ml-2 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">
                {discountPercentage}% OFF
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        <div className="mb-6">
          <p className="text-muted-foreground">{product.description}</p>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 font-medium">Size</h3>
          <RadioGroup
            value={selectedSize}
            onValueChange={setSelectedSize}
            className="flex flex-wrap gap-2"
          >
            {sizes.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={size}
                  id={`size-${size}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`size-${size}`}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-input peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                >
                  {size}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 font-medium">Color</h3>
          <RadioGroup
            value={selectedColor}
            onValueChange={setSelectedColor}
            className="flex flex-wrap gap-2"
          >
            {colors.map((color) => (
              <div key={color.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={color.value}
                  id={`color-${color.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`color-${color.value}`}
                  className="flex h-10 cursor-pointer items-center space-x-2 rounded-md border border-input px-3 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                >
                  <span
                    className="inline-block h-4 w-4 rounded-full border"
                    style={{ backgroundColor: color.value }}
                  ></span>
                  <span>{color.name}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 font-medium">Quantity</h3>
          <div className="flex h-10 w-32 items-center">
            <button
              onClick={decrementQuantity}
              className="flex h-full w-10 items-center justify-center border border-r-0 border-input hover:bg-muted"
            >
              -
            </button>
            <div className="flex h-full w-12 items-center justify-center border border-input">
              {quantity}
            </div>
            <button
              onClick={incrementQuantity}
              className="flex h-full w-10 items-center justify-center border border-l-0 border-input hover:bg-muted"
            >
              +
            </button>
          </div>
        </div>

        <div className="mb-6 flex space-x-4">
          <Button onClick={handleAddToCart} className="flex-1">
            Add to Cart
          </Button>
          <Button variant="outline" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">
              Free shipping on orders over Rs. 5,000
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <RotateCcw className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">Easy 30-day returns</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">100% authentic products</span>
          </div>
        </div>

        <Tabs defaultValue="description" className="mt-8">
          <TabsList className="w-full">
            <TabsTrigger value="description" className="flex-1">
              Description
            </TabsTrigger>
            <TabsTrigger value="details" className="flex-1">
              Details
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex-1">
              Shipping
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="description"
            className="mt-4 text-muted-foreground"
          >
            <p>{product.description || "No description available."}</p>
          </TabsContent>
          <TabsContent value="details" className="mt-4">
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>Material: 100% Cotton</li>
              <li>Fit: Regular fit</li>
              <li>Care: Machine wash cold</li>
              <li>Imported</li>
            </ul>
          </TabsContent>
          <TabsContent value="shipping" className="mt-4 text-muted-foreground">
            <p>
              Standard delivery: 3-5 business days
              <br />
              Express delivery: 1-2 business days
              <br />
              Free shipping on orders over Rs. 5,000
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
