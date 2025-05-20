"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Share2, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ProductDetailsProps = {
  product: any; // In a real app, we would define a proper type
};

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const { addToCart } = useCart();
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

    addToCart({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.image,
      quantity,
      size: selectedSize,
      color: selectedColor,
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

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={product.images[activeImage] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex space-x-2">
          {product.images.map((image: string, index: number) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={cn(
                "relative aspect-square w-20 overflow-hidden rounded-md border-2",
                activeImage === index ? "border-black" : "border-transparent"
              )}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${product.name} ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div>
        <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
        <p className="mb-4 text-gray-500">{product.category}</p>

        <div className="mb-6 flex items-center">
          {product.salePrice ? (
            <>
              <span className="text-2xl font-bold">
                Rs. {product.salePrice.toLocaleString()}
              </span>
              <span className="ml-2 text-gray-500 line-through">
                Rs. {product.price.toLocaleString()}
              </span>
              <span className="ml-2 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">
                {Math.round(
                  ((product.price - product.salePrice) / product.price) * 100
                )}
                % OFF
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold">
              Rs. {product.price.toLocaleString()}
            </span>
          )}
        </div>

        <div className="mb-6">
          <h3 className="mb-2 font-medium">Description</h3>
          <p className="text-gray-600">{product.description}</p>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 font-medium">Features</h3>
          <ul className="list-inside list-disc space-y-1 text-gray-600">
            {product.features.map((feature: string, index: number) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 font-medium">Size</h3>
          <RadioGroup
            value={selectedSize}
            onValueChange={setSelectedSize}
            className="flex flex-wrap gap-2"
          >
            {product.sizes.map((size: string) => (
              <div key={size} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={size}
                  id={`size-${size}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`size-${size}`}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-gray-200 peer-data-[state=checked]:border-black peer-data-[state=checked]:bg-black peer-data-[state=checked]:text-white"
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
            {product.colors.map((color: string) => (
              <div key={color} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={color}
                  id={`color-${color}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`color-${color}`}
                  className="flex h-10 cursor-pointer items-center justify-center rounded-md border border-gray-200 px-3 peer-data-[state=checked]:border-black peer-data-[state=checked]:bg-black peer-data-[state=checked]:text-white"
                >
                  {color}
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
              className="flex h-full w-10 items-center justify-center border border-r-0 border-gray-300 hover:bg-gray-100"
            >
              -
            </button>
            <div className="flex h-full w-12 items-center justify-center border border-gray-300">
              {quantity}
            </div>
            <button
              onClick={incrementQuantity}
              className="flex h-full w-10 items-center justify-center border border-l-0 border-gray-300 hover:bg-gray-100"
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

        <div className="space-y-4 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-gray-600" />
            <span className="text-sm">
              Free shipping on orders over Rs. 2,000
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <RotateCcw className="h-5 w-5 text-gray-600" />
            <span className="text-sm">Easy 30-day returns</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-gray-600" />
            <span className="text-sm">100% authentic products</span>
          </div>
        </div>
      </div>
    </div>
  );
}
