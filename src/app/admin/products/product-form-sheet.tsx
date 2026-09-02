"use client";

/*
 * ---------------------------------------------------------
 * PRODUCT CREATE / EDIT SHEET
 * ---------------------------------------------------------
 */

import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/src/app/components/ui/checkbox";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/app/components/ui/select";
import { Textarea } from "@/src/app/components/ui/textarea";
import { cn } from "@/src/app/lib/utils";
import { useEffect, useRef, useState } from "react";
import {
  FormActions,
  FormField,
  FormSheet,
  getErrorMessage,
  INPUT_CLASS,
} from "../components/admin-ui";
import {
  emptyProductForm,
  generateSlug,
  productFormValues,
  validateProductForm,
  type ProductFormValues,
} from "./product-form";
import { createProduct, updateProduct } from "./queries";
import type { Category, Product } from "./types";

interface ProductFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /* null = create, otherwise the product being edited. */
  product: Product | null;
  categories: Category[];
  /* The full list, so a duplicate slug is caught before saving. */
  existingProducts: Product[];
  onSaved: () => Promise<void> | void;
}

export function ProductFormSheet({
  open,
  onOpenChange,
  product,
  categories,
  existingProducts,
  onSaved,
}: ProductFormSheetProps) {
  const { toast } = useToast();

  const [values, setValues] = useState<ProductFormValues>(emptyProductForm());
  const [saving, setSaving] = useState(false);

  /*
   * Read through a ref so a background refresh of the category
   * list cannot wipe fields the admin is part-way through.
   */
  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;

  /* Seed the fields each time the sheet opens. */
  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(
      product
        ? productFormValues(product)
        : emptyProductForm(categoriesRef.current[0]?.id ?? ""),
    );
  }, [open, product]);

  const setValue = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ): void => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  /* While creating, the slug tracks the name until it is edited by hand. */
  const handleNameChange = (name: string): void => {
    setValues((current) => ({
      ...current,
      name,
      slug: product ? current.slug : generateSlug(name),
    }));
  };

  const handleOpenChange = (nextOpen: boolean): void => {
    if (saving) {
      return;
    }

    onOpenChange(nextOpen);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const { payload, error } = validateProductForm(
      values,
      existingProducts,
      product?.id ?? null,
    );

    if (error) {
      toast({ ...error, variant: "destructive" });
      return;
    }

    setSaving(true);

    try {
      if (product) {
        await updateProduct(product.id, payload, values.imageUrl);
      } else {
        await createProduct(payload, values.imageUrl);
      }

      toast({
        title: product ? "Product updated" : "Product created",
        description: `"${payload.name}" has been ${
          product ? "updated" : "created"
        } successfully.`,
      });

      await onSaved();

      /* Only close once the write actually landed. */
      onOpenChange(false);
    } catch (caught: unknown) {
      console.error("Product save error:", caught);

      toast({
        title: product ? "Update failed" : "Creation failed",
        description: getErrorMessage(caught),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={
        product ? `Edit Product: ${product.name}` : "Create New Product"
      }
      description="Add the product information below."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pr-1">
        <FormField id="form-name" label="Product Name" required>
          <Input
            id="form-name"
            value={values.name}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="e.g. Men's Casual Polo"
            required
            disabled={saving}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField id="form-slug" label="Product Slug" required>
          <Input
            id="form-slug"
            value={values.slug}
            onChange={(event) =>
              setValue("slug", generateSlug(event.target.value))
            }
            placeholder="mens-casual-polo"
            required
            disabled={saving}
            className={cn(INPUT_CLASS, "font-mono text-xs")}
          />
        </FormField>

        <FormField id="form-category" label="Category" required>
          <Select
            value={values.categoryId}
            onValueChange={(value) => setValue("categoryId", value)}
            disabled={saving}
          >
            <SelectTrigger id="form-category" className={INPUT_CLASS}>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>

            <SelectContent
              position="popper"
              className="max-h-60 w-[var(--radix-select-trigger-width)]"
            >
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id}
                  className="cursor-pointer"
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="form-price" label="Price (Rs.)" required>
            <Input
              id="form-price"
              type="number"
              min="0"
              step="0.01"
              value={values.price}
              onChange={(event) => setValue("price", event.target.value)}
              placeholder="2500"
              required
              disabled={saving}
              className={INPUT_CLASS}
            />
          </FormField>

          <FormField id="form-sale-price" label="Sale Price">
            <Input
              id="form-sale-price"
              type="number"
              min="0"
              step="0.01"
              value={values.salePrice}
              onChange={(event) => setValue("salePrice", event.target.value)}
              placeholder="Optional"
              disabled={saving}
              className={INPUT_CLASS}
            />
          </FormField>
        </div>

        <FormField id="form-stock" label="Stock Quantity" required>
          <Input
            id="form-stock"
            type="number"
            min="0"
            step="1"
            value={values.stock}
            onChange={(event) => setValue("stock", event.target.value)}
            placeholder="50"
            required
            disabled={saving}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField id="form-image" label="Primary Image URL">
          <Input
            id="form-image"
            type="url"
            value={values.imageUrl}
            onChange={(event) => setValue("imageUrl", event.target.value)}
            placeholder="https://..."
            disabled={saving}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField id="form-desc" label="Description">
          <Textarea
            id="form-desc"
            value={values.description}
            onChange={(event) => setValue("description", event.target.value)}
            placeholder="Describe the product..."
            rows={4}
            disabled={saving}
            className={INPUT_CLASS}
          />
        </FormField>

        <div className="flex items-center gap-2 pt-2">
          <Checkbox
            id="form-featured"
            checked={values.featured}
            disabled={saving}
            onCheckedChange={(checked) => setValue("featured", checked === true)}
          />

          <Label
            htmlFor="form-featured"
            className="cursor-pointer select-none text-xs font-semibold text-neutral-700"
          >
            Feature this product
          </Label>
        </div>

        <FormActions
          saving={saving}
          submitLabel={product ? "Save Changes" : "Create Product"}
          savingLabel={product ? "Saving..." : "Creating..."}
          onCancel={() => handleOpenChange(false)}
        />
      </form>
    </FormSheet>
  );
}
