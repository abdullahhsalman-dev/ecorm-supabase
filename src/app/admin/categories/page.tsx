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
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_url: string | null;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Form Sheet state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formParentId, setFormParentId] = useState<string>("none");
  const [formImageUrl, setFormImageUrl] = useState("");

  const supabase = createClient();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setCategories(data);
      } else {
        throw new Error("No database categories found");
      }
    } catch (err) {
      console.warn("Using sandbox mode for categories CRUD:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Slug during typing when not editing
  useEffect(() => {
    if (!editingCategory) {
      const generatedSlug = formName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormSlug(generatedSlug);
    }
  }, [formName, editingCategory]);

  const handleOpenForm = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormName(category.name);
      setFormSlug(category.slug);
      setFormDescription(category.description || "");
      setFormParentId(category.parent_id || "none");
      setFormImageUrl(category.image_url || "");
    } else {
      setEditingCategory(null);
      setFormName("");
      setFormSlug("");
      setFormDescription("");
      setFormParentId("none");
      setFormImageUrl("");
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName || !formSlug) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in Name and Slug.",
        variant: "destructive",
      });
      return;
    }

    const parentVal = formParentId === "none" ? null : formParentId;

    // Prevent recursive parenting (setting a category as its own parent)
    if (editingCategory && parentVal === editingCategory.id) {
      toast({
        title: "Circular Hierarchy",
        description: "A category cannot be its own parent.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: formName,
      slug: formSlug,
      description: formDescription || null,
      parent_id: parentVal,
      image_url: formImageUrl || null,
    };

    try {
      if (editingCategory) {
        if (editingCategory) {
          const { error } = await supabase
            .from("categories")
            .update(payload)
            .eq("id", editingCategory.id);

          if (error) throw error;
          toast({
            title: "Category Updated",
            description: `Category "${formName}" updated successfully.`,
          });
        } else {
          const { error } = await supabase.from("categories").insert([payload]);

          if (error) throw error;
          toast({
            title: "Category Created",
            description: `Category "${formName}" created successfully.`,
          });
        }
        await loadCategories();
      }

      setIsFormOpen(false);
    } catch (err: unknown) {
      console.error(err);
      toast({
        title: "Operation Failed",
        description:
          err instanceof Error
            ? err.message
            : "An error occurred writing data.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    // Check if category has subcategories
    const hasChildren = categories.some((c) => c.parent_id === id);
    if (hasChildren) {
      toast({
        title: "Delete Restricted",
        description: `"${name}" contains subcategories. Please reassign or delete subcategories first.`,
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      toast({
        title: "Category Deleted",
        description: `Category "${name}" deleted successfully.`,
      });
      await loadCategories();
    } catch (err: unknown) {
      console.error(err);
      toast({
        title: "Delete Failed",
        description:
          err instanceof Error ? err.message : "Could not delete category.",
        variant: "destructive",
      });
    }
  };

  // Group Categories: Parents (top-level) vs Children
  const parentCategories = categories.filter((c) => !c.parent_id);
  const getSubcategories = (parentId: string) => {
    return categories.filter((c) => c.parent_id === parentId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
            Categories
          </h1>
          <p className="text-sm text-neutral-500">
            Structure your departments, parent headers, and product
            subcategories.
          </p>
        </div>
        <Button
          onClick={() => handleOpenForm(null)}
          className="bg-[#FF3D6E] hover:bg-[#E0345F] text-white flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="border-neutral-200 shadow-sm animate-pulse"
            >
              <CardHeader className="pb-3">
                <div className="h-5 w-24 bg-neutral-200 rounded"></div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 w-full bg-neutral-200 rounded"></div>
                <div className="h-4 w-3/4 bg-neutral-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : parentCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-400 border border-dashed rounded-xl bg-white">
          <FolderOpen className="h-12 w-12 text-neutral-300 mb-3" />
          <p className="text-sm font-semibold">No categories defined yet.</p>
          <p className="text-xs text-neutral-400 mt-1">
            Get started by creating a top-level parent category.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {parentCategories.map((parent) => {
            const subs = getSubcategories(parent.id);
            return (
              <Card
                key={parent.id}
                className="border-neutral-200 shadow-sm flex flex-col justify-between overflow-hidden transition-all hover:shadow-md hover:border-neutral-300"
              >
                <div>
                  {/* Card Header (Parent name + actions) */}
                  <CardHeader className="flex flex-row items-center justify-between pb-3 bg-neutral-50/50 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <FolderTree className="h-4.5 w-4.5 text-[#FF3D6E]" />
                      <CardTitle className="text-sm font-bold text-neutral-850">
                        {parent.name}
                      </CardTitle>
                    </div>
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenForm(parent)}
                        className="h-7 w-7 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                        title="Edit parent"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(parent.id, parent.name)}
                        className="h-7 w-7 text-neutral-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete parent"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    {/* Slug and description */}
                    <div className="mb-4">
                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded border">
                        /{parent.slug}
                      </span>
                      {parent.description && (
                        <p className="text-xs text-neutral-500 mt-2 line-clamp-2">
                          {parent.description}
                        </p>
                      )}
                    </div>

                    {/* Subcategories title */}
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Subcategories ({subs.length})
                      </span>

                      {subs.length === 0 ? (
                        <p className="text-xs text-neutral-400 mt-1.5 italic">
                          No subcategories linked
                        </p>
                      ) : (
                        <div className="mt-2 space-y-1.5">
                          {subs.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between group p-1.5 rounded hover:bg-neutral-50 transition-all border border-transparent hover:border-neutral-100"
                            >
                              <div className="flex items-center gap-1.5">
                                <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
                                <span className="text-xs font-semibold text-neutral-700">
                                  {sub.name}
                                </span>
                                <span className="text-[9px] font-mono text-neutral-400">
                                  ({sub.slug})
                                </span>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenForm(sub)}
                                  className="h-6 w-6 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200"
                                  title="Edit subcategory"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(sub.id, sub.name)}
                                  className="h-6 w-6 text-neutral-400 hover:text-red-650 hover:bg-red-50"
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

                {/* Footer action to directly create child */}
                <div className="p-3 border-t bg-neutral-50/20 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleOpenForm(null);
                      setFormParentId(parent.id);
                    }}
                    className="text-xs text-neutral-500 hover:text-[#FF3D6E] font-bold h-7 w-full gap-1 hover:bg-neutral-50"
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

      {/* Slide-out Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
          <SheetHeader className="border-b pb-4 mb-6">
            <SheetTitle className="text-lg font-bold text-neutral-900">
              {editingCategory
                ? `Edit Category: ${editingCategory.name}`
                : "Create Category"}
            </SheetTitle>
            <SheetDescription className="text-xs text-neutral-400">
              Set details and place within the storefront hierarchy.
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
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="e.g. men-shirts"
                required
                className="font-mono text-xs border-neutral-200"
              />
            </div>

            {/* Parent Category Selector */}
            <div className="space-y-1.5">
              <Label
                htmlFor="cat-parent"
                className="text-xs font-bold text-neutral-700"
              >
                Parent Category (Optional)
              </Label>
              <Select value={formParentId} onValueChange={setFormParentId}>
                <SelectTrigger className="border-neutral-200">
                  <SelectValue placeholder="Select Parent Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top-Level Parent)</SelectItem>
                  {/* List top-level parents to nest under */}
                  {parentCategories
                    .filter(
                      (pc) => !editingCategory || pc.id !== editingCategory.id,
                    ) // Cannot nest under self
                    .map((pc) => (
                      <SelectItem key={pc.id} value={pc.id}>
                        {pc.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Banner/Image URL */}
            <div className="space-y-1.5">
              <Label
                htmlFor="cat-image"
                className="text-xs font-bold text-neutral-700"
              >
                Banner/Image URL
              </Label>
              <Input
                id="cat-image"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or /images/banner.jpg"
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
                className="border-neutral-200"
              />
            </div>

            {/* Submission buttons */}
            <div className="flex gap-3 pt-6 border-t mt-8">
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-neutral-300 text-neutral-600"
                >
                  Cancel
                </Button>
              </SheetClose>
              <Button
                type="submit"
                className="flex-1 bg-[#FF3D6E] hover:bg-[#E0345F] text-white"
              >
                {editingCategory ? "Save Changes" : "Create Category"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
