"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/src/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/app/components/ui/card";
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
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/src/app/components/ui/sheet";
import { Textarea } from "@/src/app/components/ui/textarea";
import { createClient } from "@/src/app/lib/supabase/client";
import {
  ChevronRight,
  Edit2,
  FolderOpen,
  FolderTree,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_url: string | null;
}

interface CategoryPayload {
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_url: string | null;
}

export default function AdminCategoriesPage() {
  const supabase = createClient();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formParentId, setFormParentId] = useState("none");
  const [formImageUrl, setFormImageUrl] = useState("");

  /*
   * ---------------------------------------------------------
   * LOAD CATEGORIES
   * ---------------------------------------------------------
   */
  const loadCategories = useCallback(async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, description, parent_id, image_url")
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }

      // Empty table is a valid state.
      setCategories((data ?? []) as Category[]);
    } catch (error) {
      console.error("Failed to load categories:", error);

      toast({
        title: "Failed to load categories",
        description:
          error instanceof Error ? error.message : "Could not load categories.",
        variant: "destructive",
      });

      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  /*
   * ---------------------------------------------------------
   * DERIVED CATEGORY DATA
   * ---------------------------------------------------------
   */

  const parentCategories = useMemo(
    () => categories.filter((category) => !category.parent_id),
    [categories],
  );

  const getSubcategories = useCallback(
    (parentId: string) => {
      return categories.filter((category) => category.parent_id === parentId);
    },
    [categories],
  );

  /*
   * ---------------------------------------------------------
   * SLUG GENERATOR
   * ---------------------------------------------------------
   */

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  /*
   * Automatically generate slug for NEW categories.
   *
   * For existing categories we don't automatically overwrite
   * the slug because the admin may intentionally have changed it.
   */
  useEffect(() => {
    if (!editingCategory) {
      setFormSlug(generateSlug(formName));
    }
  }, [formName, editingCategory]);

  /*
   * ---------------------------------------------------------
   * FORM HELPERS
   * ---------------------------------------------------------
   */

  const resetForm = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormParentId("none");
    setFormImageUrl("");
  };

  const handleOpenForm = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormName(category.name);
      setFormSlug(category.slug);
      setFormDescription(category.description ?? "");
      setFormParentId(category.parent_id ?? "none");
      setFormImageUrl(category.image_url ?? "");
    } else {
      resetForm();
    }

    setIsFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setIsFormOpen(open);

    if (!open && !saving) {
      resetForm();
    }
  };

  /*
   * ---------------------------------------------------------
   * CHECK IF CATEGORY IS DESCENDANT
   * ---------------------------------------------------------
   *
   * Example:
   *
   * Men
   *  └── Shirts
   *       └── Formal Shirts
   *
   * Men cannot have Shirts as parent.
   *
   * This prevents circular hierarchy.
   */
  const isDescendant = (
    categoryId: string,
    possibleParentId: string,
  ): boolean => {
    let currentParentId =
      categories.find((category) => category.id === possibleParentId)
        ?.parent_id ?? null;

    while (currentParentId) {
      if (currentParentId === categoryId) {
        return true;
      }

      currentParentId =
        categories.find((category) => category.id === currentParentId)
          ?.parent_id ?? null;
    }

    return false;
  };

  /*
   * ---------------------------------------------------------
   * SUBMIT CREATE / UPDATE
   * ---------------------------------------------------------
   */

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (saving) return;

    const name = formName.trim();
    const slug = formSlug.trim().toLowerCase();

    if (!name) {
      toast({
        title: "Category name required",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    if (!slug) {
      toast({
        title: "Slug required",
        description: "Please enter a category slug.",
        variant: "destructive",
      });
      return;
    }

    const parentId = formParentId === "none" ? null : formParentId;

    /*
     * Prevent category from being its own parent.
     */
    if (editingCategory && parentId === editingCategory.id) {
      toast({
        title: "Invalid parent",
        description: "A category cannot be its own parent.",
        variant: "destructive",
      });
      return;
    }

    /*
     * Prevent circular hierarchy.
     *
     * Example:
     *
     * Men
     *   └── Shirts
     *
     * You cannot edit Men and make Shirts its parent.
     */
    if (
      editingCategory &&
      parentId &&
      isDescendant(editingCategory.id, parentId)
    ) {
      toast({
        title: "Circular hierarchy",
        description:
          "You cannot select one of this category's subcategories as its parent.",
        variant: "destructive",
      });
      return;
    }

    /*
     * Prevent duplicate slug.
     */
    const duplicateSlug = categories.some(
      (category) =>
        category.slug.toLowerCase() === slug &&
        category.id !== editingCategory?.id,
    );

    if (duplicateSlug) {
      toast({
        title: "Slug already exists",
        description: "Please choose a different slug for this category.",
        variant: "destructive",
      });
      return;
    }

    const payload: CategoryPayload = {
      name,
      slug,
      description: formDescription.trim() || null,
      parent_id: parentId,
      image_url: formImageUrl.trim() || null,
    };

    setSaving(true);

    try {
      /*
       * UPDATE
       */
      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingCategory.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Category updated",
          description: `"${name}" has been updated successfully.`,
        });
      } else {
        /*
         * CREATE
         */
        const { error } = await supabase.from("categories").insert(payload);

        if (error) {
          throw error;
        }

        toast({
          title: "Category created",
          description: `"${name}" has been created successfully.`,
        });
      }

      /*
       * Refresh the list after successful operation.
       */
      await loadCategories();

      /*
       * Close and reset form ONLY after success.
       */
      setIsFormOpen(false);
      resetForm();
    } catch (error: unknown) {
      console.error("Category save error:", error);

      let message = "Could not save category.";

      if (error instanceof Error) {
        message = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        message = String((error as { message: unknown }).message);
      }

      toast({
        title: editingCategory ? "Update failed" : "Creation failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * DELETE CATEGORY
   * ---------------------------------------------------------
   */

  const handleDelete = async (id: string, name: string) => {
    if (deletingId) return;

    /*
     * Don't allow deletion when children exist.
     */
    const hasChildren = categories.some(
      (category) => category.parent_id === id,
    );

    if (hasChildren) {
      toast({
        title: "Cannot delete category",
        description: `"${name}" contains subcategories. Delete or move them first.`,
        variant: "destructive",
      });

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`,
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) {
        throw error;
      }

      toast({
        title: "Category deleted",
        description: `"${name}" has been deleted successfully.`,
      });

      await loadCategories();
    } catch (error: unknown) {
      console.error("Category delete error:", error);

      toast({
        title: "Delete failed",
        description:
          error instanceof Error ? error.message : "Could not delete category.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  /*
   * ---------------------------------------------------------
   * AVAILABLE PARENT CATEGORIES
   * ---------------------------------------------------------
   *
   * When editing a category, don't show:
   *
   * 1. The category itself
   * 2. Any of its descendants
   *
   * This prevents circular relationships.
   */
  const availableParentCategories = useMemo(() => {
    if (!editingCategory) {
      return parentCategories;
    }

    return parentCategories.filter((category) => {
      if (category.id === editingCategory.id) {
        return false;
      }

      if (isDescendant(editingCategory.id, category.id)) {
        return false;
      }

      return true;
    });
  }, [parentCategories, editingCategory, categories]);

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
            Categories
          </h1>

          <p className="text-sm text-neutral-500">
            Structure your departments, parent categories, and product
            subcategories.
          </p>
        </div>

        <Button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 self-start bg-[#FF3D6E] text-white hover:bg-[#E0345F] sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="animate-pulse border-neutral-200 shadow-sm"
            >
              <CardHeader className="pb-3">
                <div className="h-5 w-24 rounded bg-neutral-200" />
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="h-4 w-full rounded bg-neutral-200" />
                <div className="h-4 w-3/4 rounded bg-neutral-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : parentCategories.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-white p-12 text-center text-neutral-400">
          <FolderOpen className="mb-3 h-12 w-12 text-neutral-300" />

          <p className="text-sm font-semibold">No categories defined yet.</p>

          <p className="mt-1 text-xs text-neutral-400">
            Get started by creating a top-level category.
          </p>

          <Button
            onClick={() => handleOpenForm()}
            className="mt-5 bg-[#FF3D6E] text-white hover:bg-[#E0345F]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </div>
      ) : (
        /* Categories */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {parentCategories.map((parent) => {
            const subs = getSubcategories(parent.id);

            return (
              <Card
                key={parent.id}
                className="flex flex-col justify-between overflow-hidden border-neutral-200 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md"
              >
                <div>
                  {/* Parent header */}
                  <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-100 bg-neutral-50/50 pb-3">
                    <div className="flex items-center gap-2">
                      <FolderTree className="h-[18px] w-[18px] text-[#FF3D6E]" />

                      <CardTitle className="text-sm font-bold text-neutral-800">
                        {parent.name}
                      </CardTitle>
                    </div>

                    <div className="flex gap-0.5">
                      {/* Edit */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenForm(parent)}
                        className="h-7 w-7 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                        title="Edit category"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>

                      {/* Delete */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === parent.id}
                        onClick={() => handleDelete(parent.id, parent.name)}
                        className="h-7 w-7 text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Delete category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    {/* Slug */}
                    <div className="mb-4">
                      <span className="rounded border bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400">
                        /{parent.slug}
                      </span>

                      {parent.description && (
                        <p className="mt-2 line-clamp-2 text-xs text-neutral-500">
                          {parent.description}
                        </p>
                      )}
                    </div>

                    {/* Subcategories */}
                    <div className="mt-4 border-t border-neutral-100 pt-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Subcategories ({subs.length})
                      </span>

                      {subs.length === 0 ? (
                        <p className="mt-1.5 text-xs italic text-neutral-400">
                          No subcategories linked
                        </p>
                      ) : (
                        <div className="mt-2 space-y-1.5">
                          {subs.map((sub) => (
                            <div
                              key={sub.id}
                              className="group flex items-center justify-between rounded border border-transparent p-1.5 transition-all hover:border-neutral-100 hover:bg-neutral-50"
                            >
                              <div className="flex min-w-0 items-center gap-1.5">
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-300" />

                                <span className="truncate text-xs font-semibold text-neutral-700">
                                  {sub.name}
                                </span>

                                <span className="hidden truncate font-mono text-[9px] text-neutral-400 sm:inline">
                                  ({sub.slug})
                                </span>
                              </div>

                              <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenForm(sub)}
                                  className="h-6 w-6 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"
                                  title="Edit subcategory"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={deletingId === sub.id}
                                  onClick={() => handleDelete(sub.id, sub.name)}
                                  className="h-6 w-6 text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                  title="Delete subcategory"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                {/* Add subcategory */}
                <div className="border-t z-50 bg-neutral-50/20 p-3 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      handleOpenForm();
                      setFormParentId(parent.id);
                    }}
                    className="h-7 w-full gap-1 text-xs font-bold text-neutral-500 hover:bg-neutral-50 hover:text-[#FF3D6E]"
                  >
                    <Plus className="h-3 w-3" />
                    Add Subcategory
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={handleCloseForm}>
        <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-md">
          <SheetHeader className="mb-6 border-b pb-4">
            <SheetTitle className="text-lg font-bold text-neutral-900">
              {editingCategory
                ? `Edit Category: ${editingCategory.name}`
                : "Create Category"}
            </SheetTitle>

            <SheetDescription className="text-xs text-neutral-400">
              Set the category details and place it within your storefront
              hierarchy.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="cat-name"
                className="text-xs font-bold text-neutral-700"
              >
                Category Name <span className="text-red-500">*</span>
              </Label>

              <Input
                id="cat-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Shirts, Blazers"
                required
                disabled={saving}
                className="border-neutral-200"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label
                htmlFor="cat-slug"
                className="text-xs font-bold text-neutral-700"
              >
                Slug <span className="text-red-500">*</span>
              </Label>

              <Input
                id="cat-slug"
                value={formSlug}
                onChange={(e) => setFormSlug(generateSlug(e.target.value))}
                placeholder="e.g. men-shirts"
                required
                disabled={saving}
                className="border-neutral-200 font-mono text-xs"
              />

              <p className="text-[10px] text-neutral-400">
                Used in URLs. Example: /categories/
                {formSlug || "category"}
              </p>
            </div>

            {/* Parent */}
            <div className="space-y-1.5">
              <Label
                htmlFor="cat-parent"
                className="text-xs font-bold text-neutral-700"
              >
                Parent Category (Optional)
              </Label>

              <Select
                value={formParentId}
                onValueChange={setFormParentId}
                disabled={saving}
              >
                <SelectTrigger className="border-neutral-200">
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="none">
                    None (Top-Level Category)
                  </SelectItem>

                  {availableParentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image */}
            <div className="space-y-1.5">
              <Label
                htmlFor="cat-image"
                className="text-xs font-bold text-neutral-700"
              >
                Banner / Image URL
              </Label>

              <Input
                id="cat-image"
                type="url"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                placeholder="https://..."
                disabled={saving}
                className="border-neutral-200"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label
                htmlFor="cat-desc"
                className="text-xs font-bold text-neutral-700"
              >
                Description
              </Label>

              <Textarea
                id="cat-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief summary of items in this category..."
                rows={3}
                disabled={saving}
                className="border-neutral-200"
              />
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-3 border-t pt-6">
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  className="flex-1 border-neutral-300 text-neutral-600"
                >
                  Cancel
                </Button>
              </SheetClose>

              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#FF3D6E] text-white hover:bg-[#E0345F]"
              >
                {saving
                  ? editingCategory
                    ? "Saving..."
                    : "Creating..."
                  : editingCategory
                    ? "Save Changes"
                    : "Create Category"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
