"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Slider } from "@/src/app/components/ui/slider";
import { Checkbox } from "@/src/app/components/ui/checkbox";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/app/components/ui/accordion";

interface ProductFiltersProps {
  categoryId?: string;
}

export function ProductFilters({ categoryId }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Price range
  const [priceRange, setPriceRange] = useState([
    Number.parseInt(searchParams.get("minPrice") || "0"),
    Number.parseInt(searchParams.get("maxPrice") || "10000"),
  ]);

  // Size filters
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    searchParams.get("sizes")?.split(",") || []
  );

  // Color filters
  const colors = [
    { name: "Black", value: "black" },
    { name: "White", value: "white" },
    { name: "Red", value: "red" },
    { name: "Blue", value: "blue" },
    { name: "Green", value: "green" },
    { name: "Yellow", value: "yellow" },
  ];
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.get("colors")?.split(",") || []
  );

  const handleSizeChange = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleColorChange = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Update price range
    params.set("minPrice", priceRange[0].toString());
    params.set("maxPrice", priceRange[1].toString());

    // Update sizes
    if (selectedSizes.length > 0) {
      params.set("sizes", selectedSizes.join(","));
    } else {
      params.delete("sizes");
    }

    // Update colors
    if (selectedColors.length > 0) {
      params.set("colors", selectedColors.join(","));
    } else {
      params.delete("colors");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    setPriceRange([0, 10000]);
    setSelectedSizes([]);
    setSelectedColors([]);
    router.push(pathname);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Reset
        </Button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["price", "size", "color"]}
        className="w-full"
      >
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                min={0}
                max={10000}
                step={100}
                onValueChange={setPriceRange}
              />
              <div className="flex items-center justify-between">
                <div className="w-20">
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([
                        Number.parseInt(e.target.value),
                        priceRange[1],
                      ])
                    }
                    min={0}
                    max={priceRange[1]}
                  />
                </div>
                <span>to</span>
                <div className="w-20">
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([
                        priceRange[0],
                        Number.parseInt(e.target.value),
                      ])
                    }
                    min={priceRange[0]}
                    max={10000}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size">
          <AccordionTrigger>Size</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2">
              {sizes.map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size}`}
                    checked={selectedSizes.includes(size)}
                    onCheckedChange={() => handleSizeChange(size)}
                  />
                  <Label htmlFor={`size-${size}`} className="cursor-pointer">
                    {size}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="color">
          <AccordionTrigger>Color</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2">
              {colors.map((color) => (
                <div key={color.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color.value}`}
                    checked={selectedColors.includes(color.value)}
                    onCheckedChange={() => handleColorChange(color.value)}
                  />
                  <Label
                    htmlFor={`color-${color.value}`}
                    className="flex cursor-pointer items-center"
                  >
                    <span
                      className="mr-2 inline-block h-4 w-4 rounded-full border"
                      style={{ backgroundColor: color.value }}
                    ></span>
                    {color.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button onClick={applyFilters} className="w-full">
        Apply Filters
      </Button>
    </div>
  );
}
