"use client";

/*
 * ---------------------------------------------------------
 * CATEGORY FORM SHEET
 * ---------------------------------------------------------
 *
 * Owns the form's values; validation lives in category-form.
 */

import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/app/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/src/app/components/ui/sheet";
import { Textarea } from "@/src/app/components/ui/textarea";
import type { CategoryRecord } from "@/src/app/lib/categories";
import { cn } from "@/src/app/lib/utils";
import { useEffect, useState } from "react";
import {
  FormActions,
  INPUT_CLASS,
  LABEL_CLASS,
} from "../components/admin-ui";
import {
  availableParents,
  categoryFormValues,
  emptyCategoryForm,
  generateSlug,
  NO_PARENT,
  validateCategoryForm,
  type CategoryFormValues,
  type ValidationError,
} from "./category-form";
import type { CategoryPayload } from "@/src/app/lib/categories";

interface CategoryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /* Null creates; a record edits. */
  editing: CategoryRecord | null;
  /* Pre-selected parent when opened via "Add Subcategory". */
  presetParentId: string | null;
  categories: CategoryRecord[];
  saving: boolean;
  onInvalid: (error: ValidationError) => void;
  onSubmit: (payload: CategoryPayload) => void;
}

export function CategoryFormSheet({
  open,
  onOpenChange,
  editing,
  presetParentId,
  categories,
  saving,
  onInvalid,
  onSubmit,
}: CategoryFormSheetProps) {
  const [values, setValues] = useState<CategoryFormValues>(emptyCategoryForm());

  /* Reload the form whenever the sheet opens on a new target. */
  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(
      editing
        ? categoryFormValues(editing)
        : emptyCategoryForm(presetParentId ?? NO_PARENT),
    );
  }, [open, editing, presetParentId]);

  const setField = (field: keyof CategoryFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  /*
   * A new category's slug follows its name. An existing one's
   * does not: the admin may have changed it deliberately, and
   * the slug is in URLs the store has already published.
   */
  const handleNameChange = (name: string) => {
    setValues((prev) => ({
      ...prev,
      name,
      slug: editing ? prev.slug : generateSlug(name),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const result = validateCategoryForm(
      values,
      categories,
      editing?.id ?? null,
    );

    if (result.error) {
      onInvalid(result.error);
      return;
    }

    onSubmit(result.payload);
  };

  const parents = availableParents(categories, editing?.id ?? null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-md">
        <SheetHeader className="mb-6 border-b border-neutral-100 pb-4">
          <SheetTitle className="text-lg font-bold text-neutral-900">
            {editing ? `Edit Category: ${editing.name}` : "Create Category"}
          </SheetTitle>

          <SheetDescription className="text-xs text-neutral-400">
            Set the category details and place it within your storefront
            hierarchy.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name" className={LABEL_CLASS}>
              Category Name <span className="text-red-500">*</span>
            </Label>

            <Input
              id="cat-name"
              value={values.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Shirts, Blazers"
              required
              disabled={saving}
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-slug" className={LABEL_CLASS}>
              Slug <span className="text-red-500">*</span>
            </Label>

            <Input
              id="cat-slug"
              value={values.slug}
              onChange={(e) => setField("slug", generateSlug(e.target.value))}
              placeholder="e.g. men-shirts"
              required
              disabled={saving}
              className={cn(INPUT_CLASS, "font-mono text-xs")}
            />

            <p className="text-[10px] text-neutral-400">
              Used in the URL. A top-level category is served at /
              {values.slug || "category"}; a child at /parent/
              {values.slug || "category"}.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-parent" className={LABEL_CLASS}>
              Parent Category (Optional)
            </Label>

            <Select
              value={values.parentId}
              onValueChange={(value) => setField("parentId", value)}
              disabled={saving}
            >
              <SelectTrigger className={INPUT_CLASS}>
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={NO_PARENT}>
                  None (Top-Level Category)
                </SelectItem>

                {parents.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-image" className={LABEL_CLASS}>
              Banner / Image URL
            </Label>

            <Input
              id="cat-image"
              type="url"
              value={values.imageUrl}
              onChange={(e) => setField("imageUrl", e.target.value)}
              placeholder="https://..."
              disabled={saving}
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-desc" className={LABEL_CLASS}>
              Description
            </Label>

            <Textarea
              id="cat-desc"
              value={values.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Brief summary of items in this category..."
              rows={3}
              disabled={saving}
              className={INPUT_CLASS}
            />
          </div>

          <FormActions
            saving={saving}
            submitLabel={editing ? "Save Changes" : "Create Category"}
            savingLabel={editing ? "Saving..." : "Creating..."}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </SheetContent>
    </Sheet>
  );
}
