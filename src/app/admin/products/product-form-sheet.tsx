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
import { cn, safeImageSrc } from "@/src/app/lib/utils";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FormActions,
  FormField,
  FormSheet,
  getErrorMessage,
  INPUT_CLASS,
} from "../components/admin-ui";
import {
  formatBytes,
  IMAGE_ACCEPT,
  MAX_IMAGE_BYTES,
  removeImage,
  uploadImage,
  validateImageFile,
} from "../lib/storage";
import {
  emptyProductForm,
  generateSlug,
  productFormValues,
  validateProductForm,
  type ProductFormValues,
} from "./product-form";
import { createProduct, updateProduct } from "./queries";
import { primaryImageOf, type Category, type Product } from "./types";

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
  const [uploading, setUploading] = useState(false);

  /* Clearing the input by hand is what lets the same file be re-picked. */
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      product ? productFormValues(product) : emptyProductForm(categoriesRef.current[0]?.id ?? "")
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open, product]);

  /*
   * A picked file is previewed from an object URL, which has to
   * be revoked or the blob is held until the tab closes.
   */
  const filePreview = useMemo(
    () => (values.imageFile ? URL.createObjectURL(values.imageFile) : null),
    [values.imageFile]
  );

  useEffect(() => {
    if (!filePreview) {
      return;
    }

    return () => URL.revokeObjectURL(filePreview);
  }, [filePreview]);

  /* Both save paths are blocking, so the whole form locks. */
  const busy = saving || uploading;

  /* A pending file wins over whatever is already saved. */
  const previewSrc = filePreview ?? (values.imageUrl ? safeImageSrc(values.imageUrl) : null);

  const setValue = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K]
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

  /*
   * The file is only held in state here; it is uploaded on
   * submit so an abandoned sheet leaves nothing in the bucket.
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    const reason = validateImageFile(file);

    if (reason) {
      toast({
        title: "Invalid image",
        description: reason,
        variant: "destructive",
      });

      event.target.value = "";
      return;
    }

    setValue("imageFile", file);
  };

  /* Drops both the pending file and the image already saved. */
  const handleClearImage = (): void => {
    setValues((current) => ({ ...current, imageFile: null, imageUrl: "" }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenChange = (nextOpen: boolean): void => {
    if (busy) {
      return;
    }

    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (busy) {
      return;
    }

    const { payload, error } = validateProductForm(values, existingProducts, product?.id ?? null);

    if (error) {
      toast({ ...error, variant: "destructive" });
      return;
    }

    /* The picture the product points at before this save. */
    const previousImageUrl = product ? (primaryImageOf(product)?.image_url ?? "") : "";

    let imageUrl = values.imageUrl;

    if (values.imageFile) {
      setUploading(true);

      try {
        imageUrl = await uploadImage(values.imageFile, "products", payload.slug);

        /*
         * The file is in the bucket now. Folding it into the
         * form means a failed save can be retried without
         * uploading a second copy.
         */
        setValues((current) => ({ ...current, imageUrl, imageFile: null }));

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (caught: unknown) {
        console.error("Product image upload error:", caught);

        toast({
          title: "Image upload failed",
          description: getErrorMessage(caught),
          variant: "destructive",
        });

        return;
      } finally {
        setUploading(false);
      }
    }

    setSaving(true);

    try {
      if (product) {
        await updateProduct(product.id, payload, imageUrl);
      } else {
        await createProduct(payload, imageUrl);
      }

      /*
       * The row points elsewhere now, so the file it replaced is
       * dead weight. Cleanup never fails the save.
       */
      if (previousImageUrl && previousImageUrl !== imageUrl) {
        await removeImage(previousImageUrl);
      }

      toast({
        title: product ? "Product updated" : "Product created",
        description: `"${payload.name}" has been ${product ? "updated" : "created"} successfully.`,
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
      title={product ? `Edit Product: ${product.name}` : "Create New Product"}
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
            disabled={busy}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField id="form-slug" label="Product Slug" required>
          <Input
            id="form-slug"
            value={values.slug}
            onChange={(event) => setValue("slug", generateSlug(event.target.value))}
            placeholder="mens-casual-polo"
            required
            disabled={busy}
            className={cn(INPUT_CLASS, "font-mono text-xs")}
          />
        </FormField>

        <FormField id="form-category" label="Category" required>
          <Select
            value={values.categoryId}
            onValueChange={(value) => setValue("categoryId", value)}
            disabled={busy}
          >
            <SelectTrigger id="form-category" className={INPUT_CLASS}>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>

            <SelectContent
              position="popper"
              className="max-h-60 w-[var(--radix-select-trigger-width)]"
            >
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id} className="cursor-pointer">
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
              disabled={busy}
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
              disabled={busy}
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
            disabled={busy}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField id="form-image" label="Primary Image">
          <div className="flex items-start gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
              {previewSrc ? (
                /*
                 * A pending file is previewed from a blob: URL,
                 * which next/image cannot take, so both the saved
                 * and the pending state render through plain img.
                 */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewSrc}
                  alt="Product image preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="h-7 w-7 text-neutral-300" />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <input
                ref={fileInputRef}
                id="form-image"
                type="file"
                accept={IMAGE_ACCEPT}
                onChange={handleFileChange}
                disabled={busy}
                className="block w-full cursor-pointer text-xs text-neutral-500 file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-neutral-200 file:bg-neutral-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-neutral-700 hover:file:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
              />

              {values.imageFile ? (
                <p className="flex items-center gap-1 truncate text-[11px] text-neutral-600">
                  <Upload className="h-3 w-3 shrink-0" />
                  {values.imageFile.name} ({formatBytes(values.imageFile.size)}) — uploads on save
                </p>
              ) : (
                <p className="text-[11px] text-neutral-400">
                  JPEG, PNG, WebP, AVIF or GIF — up to {formatBytes(MAX_IMAGE_BYTES)}.
                </p>
              )}

              {previewSrc ? (
                <button
                  type="button"
                  onClick={handleClearImage}
                  disabled={busy}
                  className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 disabled:opacity-60"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove image
                </button>
              ) : null}
            </div>
          </div>
        </FormField>

        <FormField id="form-desc" label="Description">
          <Textarea
            id="form-desc"
            value={values.description}
            onChange={(event) => setValue("description", event.target.value)}
            placeholder="Describe the product..."
            rows={4}
            disabled={busy}
            className={INPUT_CLASS}
          />
        </FormField>

        <div className="flex items-center gap-2 pt-2">
          <Checkbox
            id="form-featured"
            checked={values.featured}
            disabled={busy}
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
          saving={busy}
          submitLabel={product ? "Save Changes" : "Create Product"}
          savingLabel={uploading ? "Uploading image..." : product ? "Saving..." : "Creating..."}
          onCancel={() => handleOpenChange(false)}
        />
      </form>
    </FormSheet>
  );
}
