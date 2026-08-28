"use client";

import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/src/app/components/ui/badge";
import { Button } from "@/src/app/components/ui/button";
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
  AlertTriangle,
  CheckCircle,
  Edit2,
  Image as ImageIcon,
  PackageOpen,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

/*
 * ---------------------------------------------------------
 * TYPES
 * ---------------------------------------------------------
 */

interface ProductImage {
  id?: string;
  image_url: string;
  is_primary: boolean;
}

interface ProductCategory {
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  category_id: string;
  featured: boolean;
  categories: ProductCategory | null;
  product_images: ProductImage[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductPayload {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  category_id: string;
  featured: boolean;
}

/*
 * ---------------------------------------------------------
 * ERROR HELPER
 * ---------------------------------------------------------
 */

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return "An unexpected error occurred.";
};

/*
 * ---------------------------------------------------------
 * SLUG HELPER
 * ---------------------------------------------------------
 */

const generateSlug = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/*
 * ---------------------------------------------------------
 * COMPONENT
 * ---------------------------------------------------------
 */

export default function AdminProductsPage() {
  const supabase = createClient();
  const { toast } = useToast();

  /*
   * -------------------------------------------------------
   * STATE
   * -------------------------------------------------------
   */

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search / filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");

  // Form
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formName, setFormName] = useState<string>("");
  const [formSlug, setFormSlug] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formPrice, setFormPrice] = useState<string>("");
  const [formSalePrice, setFormSalePrice] = useState<string>("");
  const [formStock, setFormStock] = useState<string>("");
  const [formCategoryId, setFormCategoryId] = useState<string>("");
  const [formFeatured, setFormFeatured] = useState<boolean>(false);
  const [formImageUrl, setFormImageUrl] = useState<string>("");

  /*
   * -------------------------------------------------------
   * LOAD DATA
   * -------------------------------------------------------
   */

  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);

    try {
      /*
       * Load categories.
       */
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (categoryError) {
        throw categoryError;
      }

      setCategories(categoryData ?? []);

      /*
       * Load products.
       */
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(
          `
            id,
            name,
            slug,
            description,
            price,
            sale_price,
            stock_quantity,
            category_id,
            featured,
            categories:category_id (
              name,
              slug
            ),
            product_images (
              id,
              image_url,
              is_primary
            )
          `,
        )
        .order("created_at", { ascending: false });

      if (productError) {
        throw productError;
      }

      /*
       * Supabase numeric fields can sometimes be returned
       * as strings depending on the database type.
       */
      const formattedProducts: Product[] = (productData ?? []).map(
        (product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description ?? null,
          price: Number(product.price),
          sale_price:
            product.sale_price === null || product.sale_price === undefined
              ? null
              : Number(product.sale_price),
          stock_quantity: Number(product.stock_quantity),
          category_id: product.category_id,
          featured: Boolean(product.featured),

          /*
           * Relationship can be null depending on the data.
           */
          categories:
            product.categories && !Array.isArray(product.categories)
              ? {
                  name: product.categories.name ?? "",
                  slug: product.categories.slug ?? "",
                }
              : null,

          product_images: Array.isArray(product.product_images)
            ? product.product_images.map((image) => ({
                id: image.id,
                image_url: image.image_url,
                is_primary: Boolean(image.is_primary),
              }))
            : [],
        }),
      );

      setProducts(formattedProducts);
    } catch (error: unknown) {
      console.error("Failed to load products:", error);

      toast({
        title: "Failed to load products",
        description: getErrorMessage(error),
        variant: "destructive",
      });

      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /*
   * -------------------------------------------------------
   * AUTO GENERATE SLUG
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (editingProduct === null) {
      setFormSlug(generateSlug(formName));
    }
  }, [formName, editingProduct]);

  /*
   * -------------------------------------------------------
   * RESET FORM
   * -------------------------------------------------------
   */

  const resetForm = (): void => {
    setEditingProduct(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormPrice("");
    setFormSalePrice("");
    setFormStock("");
    setFormCategoryId("");
    setFormFeatured(false);
    setFormImageUrl("");
  };

  /*
   * -------------------------------------------------------
   * OPEN FORM
   * -------------------------------------------------------
   */

  const handleOpenForm = (product: Product | null = null): void => {
    if (product !== null) {
      setEditingProduct(product);

      setFormName(product.name);
      setFormSlug(product.slug);
      setFormDescription(product.description ?? "");
      setFormPrice(String(product.price));

      setFormSalePrice(
        product.sale_price !== null ? String(product.sale_price) : "",
      );

      setFormStock(String(product.stock_quantity));
      setFormCategoryId(product.category_id);
      setFormFeatured(product.featured);

      const primaryImage =
        product.product_images.find((image) => image.is_primary) ??
        product.product_images[0];

      setFormImageUrl(primaryImage?.image_url ?? "");
    } else {
      resetForm();

      /*
       * Default to first available category.
       */
      setFormCategoryId(categories[0]?.id ?? "");
    }

    setIsFormOpen(true);
  };

  /*
   * -------------------------------------------------------
   * CLOSE FORM
   * -------------------------------------------------------
   */

  const handleFormOpenChange = (open: boolean): void => {
    if (saving) {
      return;
    }

    setIsFormOpen(open);

    if (!open) {
      resetForm();
    }
  };

  /*
   * -------------------------------------------------------
   * VALIDATE FORM
   * -------------------------------------------------------
   */

  const validateForm = (): ProductPayload | null => {
    const name = formName.trim();
    const slug = formSlug.trim().toLowerCase();

    if (!name) {
      toast({
        title: "Product name required",
        description: "Please enter a product name.",
        variant: "destructive",
      });

      return null;
    }

    if (!slug) {
      toast({
        title: "Product slug required",
        description: "Please enter a product slug.",
        variant: "destructive",
      });

      return null;
    }

    if (!formCategoryId) {
      toast({
        title: "Category required",
        description: "Please select a category.",
        variant: "destructive",
      });

      return null;
    }

    const price = Number.parseFloat(formPrice);

    if (!Number.isFinite(price) || price < 0) {
      toast({
        title: "Invalid price",
        description: "Price must be a valid number greater than or equal to 0.",
        variant: "destructive",
      });

      return null;
    }

    const stock = Number.parseInt(formStock, 10);

    if (!Number.isInteger(stock) || stock < 0) {
      toast({
        title: "Invalid stock",
        description:
          "Stock quantity must be a whole number greater than or equal to 0.",
        variant: "destructive",
      });

      return null;
    }

    let salePrice: number | null = null;

    if (formSalePrice.trim() !== "") {
      salePrice = Number.parseFloat(formSalePrice);

      if (!Number.isFinite(salePrice) || salePrice < 0) {
        toast({
          title: "Invalid sale price",
          description: "Sale price must be a valid number.",
          variant: "destructive",
        });

        return null;
      }

      if (salePrice > price) {
        toast({
          title: "Invalid sale price",
          description: "Sale price cannot be greater than the regular price.",
          variant: "destructive",
        });

        return null;
      }
    }

    /*
     * Prevent duplicate slugs.
     */
    const duplicateSlug = products.some(
      (product) =>
        product.slug.toLowerCase() === slug &&
        product.id !== editingProduct?.id,
    );

    if (duplicateSlug) {
      toast({
        title: "Slug already exists",
        description: "Please choose a different product slug.",
        variant: "destructive",
      });

      return null;
    }

    return {
      name,
      slug,
      description: formDescription.trim() || null,
      price,
      sale_price: salePrice,
      stock_quantity: stock,
      category_id: formCategoryId,
      featured: formFeatured,
    };
  };

  /*
   * -------------------------------------------------------
   * SAVE PRODUCT
   * -------------------------------------------------------
   */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    if (saving) {
      return;
    }

    const payload = validateForm();

    if (payload === null) {
      return;
    }

    setSaving(true);

    try {
      /*
       * ---------------------------------------------------
       * UPDATE
       * ---------------------------------------------------
       */

      if (editingProduct !== null) {
        const { error: updateError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);

        if (updateError) {
          throw updateError;
        }

        /*
         * Update primary image.
         */
        await savePrimaryImage(editingProduct.id, formImageUrl.trim());

        toast({
          title: "Product updated",
          description: `"${payload.name}" has been updated successfully.`,
        });
      } else {
        /*
         * ---------------------------------------------------
         * CREATE
         * ---------------------------------------------------
         */
        const { data: newProduct, error: insertError } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();

        if (insertError) {
          throw insertError;
        }

        if (!newProduct) {
          throw new Error(
            "Product was created but no product ID was returned.",
          );
        }

        /*
         * Create primary image if provided.
         */
        if (formImageUrl.trim()) {
          const { error: imageError } = await supabase
            .from("product_images")
            .insert({
              product_id: newProduct.id,
              image_url: formImageUrl.trim(),
              is_primary: true,
            });

          if (imageError) {
            /*
             * Product was already created.
             * Throwing here makes the admin aware that
             * image creation failed.
             */
            throw imageError;
          }
        }

        toast({
          title: "Product created",
          description: `"${payload.name}" has been created successfully.`,
        });
      }

      /*
       * Refresh database data.
       */
      await loadData();

      /*
       * Close only after successful operation.
       */
      setIsFormOpen(false);
      resetForm();
    } catch (error: unknown) {
      console.error("Product save error:", error);

      toast({
        title: editingProduct !== null ? "Update failed" : "Creation failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  /*
   * -------------------------------------------------------
   * SAVE PRIMARY IMAGE
   * -------------------------------------------------------
   */

  const savePrimaryImage = async (
    productId: string,
    imageUrl: string,
  ): Promise<void> => {
    const trimmedUrl = imageUrl.trim();

    /*
     * Get existing primary image.
     */
    const { data: existingImage, error: selectError } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .eq("is_primary", true)
      .limit(1)
      .maybeSingle();

    if (selectError) {
      throw selectError;
    }

    /*
     * If image URL was removed, delete the primary image.
     */
    if (!trimmedUrl) {
      if (existingImage) {
        const { error: deleteError } = await supabase
          .from("product_images")
          .delete()
          .eq("id", existingImage.id);

        if (deleteError) {
          throw deleteError;
        }
      }

      return;
    }

    /*
     * Update existing primary image.
     */
    if (existingImage) {
      const { error: updateError } = await supabase
        .from("product_images")
        .update({
          image_url: trimmedUrl,
          is_primary: true,
        })
        .eq("id", existingImage.id);

      if (updateError) {
        throw updateError;
      }

      return;
    }

    /*
     * No primary image exists, so create one.
     */
    const { error: insertError } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        image_url: trimmedUrl,
        is_primary: true,
      });

    if (insertError) {
      throw insertError;
    }
  };

  /*
   * -------------------------------------------------------
   * DELETE PRODUCT
   * -------------------------------------------------------
   */

  const handleDelete = async (id: string, name: string): Promise<void> => {
    if (deletingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      /*
       * Delete product images first.
       *
       * This is useful if your FK doesn't have
       * ON DELETE CASCADE.
       */
      const { error: imageDeleteError } = await supabase
        .from("product_images")
        .delete()
        .eq("product_id", id);

      if (imageDeleteError) {
        throw imageDeleteError;
      }

      /*
       * Delete product.
       */
      const { error: productDeleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (productDeleteError) {
        throw productDeleteError;
      }

      /*
       * Remove immediately from UI.
       */
      setProducts((previousProducts) =>
        previousProducts.filter((product) => product.id !== id),
      );

      toast({
        title: "Product deleted",
        description: `"${name}" has been deleted successfully.`,
      });
    } catch (error: unknown) {
      console.error("Product delete error:", error);

      toast({
        title: "Delete failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  /*
   * -------------------------------------------------------
   * FILTERED PRODUCTS
   * -------------------------------------------------------
   */

  const filteredProducts = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      /*
       * Search
       */
      const matchesSearch =
        search === "" ||
        product.name.toLowerCase().includes(search) ||
        product.slug.toLowerCase().includes(search);

      /*
       * Category
       */
      const matchesCategory =
        categoryFilter === "all" || product.category_id === categoryFilter;

      /*
       * Stock
       */
      let matchesStock = true;

      if (stockFilter === "out") {
        matchesStock = product.stock_quantity === 0;
      } else if (stockFilter === "low") {
        matchesStock =
          product.stock_quantity > 0 && product.stock_quantity < 10;
      } else if (stockFilter === "in") {
        matchesStock = product.stock_quantity >= 10;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  /*
   * -------------------------------------------------------
   * STOCK BADGE
   * -------------------------------------------------------
   */

  const getStockBadge = (stock: number): React.ReactNode => {
    if (stock === 0) {
      return (
        <Badge className="flex w-fit items-center gap-1 border border-red-200 bg-red-50 text-[10px] font-bold text-red-700 hover:bg-red-50">
          <XCircle className="h-3 w-3 text-red-500" />
          Out of Stock
        </Badge>
      );
    }

    if (stock < 10) {
      return (
        <Badge className="flex w-fit items-center gap-1 border border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700 hover:bg-amber-50">
          <AlertTriangle className="h-3 w-3 text-amber-500" />
          Low Stock ({stock})
        </Badge>
      );
    }

    return (
      <Badge className="flex w-fit items-center gap-1 border border-green-200 bg-green-50 text-[10px] font-bold text-green-700 hover:bg-green-50">
        <CheckCircle className="h-3 w-3 text-green-500" />
        In Stock ({stock})
      </Badge>
    );
  };

  /*
   * -------------------------------------------------------
   * RENDER
   * -------------------------------------------------------
   */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
            Products
          </h1>

          <p className="text-sm text-neutral-500">
            Create, update, and manage your inventory items.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => handleOpenForm()}
          disabled={saving}
          className="flex items-center gap-2 self-start bg-[#FF3D6E] text-white hover:bg-[#E0345F] sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

          <Input
            placeholder="Search by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-neutral-200 pl-9"
          />
        </div>

        <div className="w-full md:w-48">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="border-neutral-200">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>

              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48">
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="border-neutral-200">
              <SelectValue placeholder="All Stock Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Stock Status</SelectItem>

              <SelectItem value="in">In Stock (10+)</SelectItem>

              <SelectItem value="low">Low Stock (&lt;10)</SelectItem>

              <SelectItem value="out">Out of Stock (0)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-4 p-8">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center gap-4"
                >
                  <div className="h-10 w-10 rounded bg-neutral-200" />
                  <div className="h-4 w-40 rounded bg-neutral-200" />
                  <div className="h-4 w-20 rounded bg-neutral-200" />
                  <div className="h-4 w-24 rounded bg-neutral-200" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-400">
              <PackageOpen className="mb-3 h-12 w-12 text-neutral-300" />

              <p className="text-sm font-semibold">No products found.</p>

              <p className="mt-1 text-xs text-neutral-400">
                Try changing your filters or create a new product.
              </p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/55 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  <th className="px-6 py-3">Product</th>

                  <th className="px-6 py-3">Category</th>

                  <th className="px-6 py-3">Price</th>

                  <th className="px-6 py-3">Stock</th>

                  <th className="px-6 py-3">Featured</th>

                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100 text-sm">
                {filteredProducts.map((product) => {
                  const primaryImage =
                    product.product_images.find((image) => image.is_primary) ??
                    product.product_images[0];

                  return (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-neutral-50/30"
                    >
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
                            {primaryImage ? (
                              <img
                                src={primaryImage.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-neutral-300" />
                            )}
                          </div>

                          <div>
                            <div className="font-bold leading-tight text-neutral-800">
                              {product.name}
                            </div>

                            <div className="mt-0.5 font-mono text-[10px] text-neutral-400">
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="z-20 px-6 py-4 text-neutral-600">
                        {product.categories?.name ?? "Uncategorized"}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        {product.sale_price !== null ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-[#FF3D6E]">
                              Rs. {product.sale_price.toLocaleString()}
                            </span>

                            <span className="text-[10px] text-neutral-400 line-through">
                              Rs. {product.price.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-neutral-800">
                            Rs. {product.price.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        {getStockBadge(product.stock_quantity)}
                      </td>

                      {/* Featured */}
                      <td className="px-6 py-4">
                        {product.featured ? (
                          <Badge className="border-none bg-[#FF3D6E]/10 text-[9px] font-bold text-[#FF3D6E] hover:bg-[#FF3D6E]/15">
                            FEATURED
                          </Badge>
                        ) : (
                          <span className="text-xs text-neutral-300">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="space-x-1 px-6 py-4 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenForm(product)}
                          className="h-8 w-8 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === product.id}
                          onClick={() => handleDelete(product.id, product.name)}
                          className="h-8 w-8 text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Form */}
      <Sheet open={isFormOpen} onOpenChange={handleFormOpenChange}>
        <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-lg">
          <SheetHeader className="mb-6 border-b pb-4">
            <SheetTitle className="text-lg font-bold text-neutral-900">
              {editingProduct !== null
                ? `Edit Product: ${editingProduct.name}`
                : "Create New Product"}
            </SheetTitle>

            <SheetDescription className="text-xs text-neutral-400">
              Add the product information below.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pr-1">
            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="form-name"
                className="text-xs font-bold text-neutral-700"
              >
                Product Name <span className="text-red-500">*</span>
              </Label>

              <Input
                id="form-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Men's Casual Polo"
                required
                disabled={saving}
                className="border-neutral-200"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label
                htmlFor="form-slug"
                className="text-xs font-bold text-neutral-700"
              >
                Product Slug <span className="text-red-500">*</span>
              </Label>

              <Input
                id="form-slug"
                value={formSlug}
                onChange={(e) => setFormSlug(generateSlug(e.target.value))}
                placeholder="mens-casual-polo"
                required
                disabled={saving}
                className="border-neutral-200 font-mono text-xs"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-700">
                Category <span className="text-red-500">*</span>
              </Label>

              <Select
                value={formCategoryId}
                onValueChange={setFormCategoryId}
                disabled={saving}
              >
                <SelectTrigger className="border-neutral-200 z-50">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>

                <SelectContent
                  position="popper"
                  className="z-[9999] max-h-60 w-[var(--radix-select-trigger-width)]"
                >
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className="cursor-pointer z-50"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="form-price"
                  className="text-xs font-bold text-neutral-700"
                >
                  Price (Rs.) <span className="text-red-500">*</span>
                </Label>

                <Input
                  id="form-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="2500"
                  required
                  disabled={saving}
                  className="border-neutral-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="form-sale-price"
                  className="text-xs font-bold text-neutral-700"
                >
                  Sale Price
                </Label>

                <Input
                  id="form-sale-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formSalePrice}
                  onChange={(e) => setFormSalePrice(e.target.value)}
                  placeholder="Optional"
                  disabled={saving}
                  className="border-neutral-200"
                />
              </div>
            </div>

            {/* Stock */}
            <div className="space-y-1.5">
              <Label
                htmlFor="form-stock"
                className="text-xs font-bold text-neutral-700"
              >
                Stock Quantity <span className="text-red-500">*</span>
              </Label>

              <Input
                id="form-stock"
                type="number"
                min="0"
                step="1"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                placeholder="50"
                required
                disabled={saving}
                className="border-neutral-200"
              />
            </div>

            {/* Image */}
            <div className="space-y-1.5">
              <Label
                htmlFor="form-image"
                className="text-xs font-bold text-neutral-700"
              >
                Primary Image URL
              </Label>

              <Input
                id="form-image"
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
                htmlFor="form-desc"
                className="text-xs font-bold text-neutral-700"
              >
                Description
              </Label>

              <Textarea
                id="form-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe the product..."
                rows={4}
                disabled={saving}
                className="border-neutral-200"
              />
            </div>

            {/* Featured */}
            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="form-featured"
                checked={formFeatured}
                disabled={saving}
                onCheckedChange={(checked) => setFormFeatured(checked === true)}
              />

              <Label
                htmlFor="form-featured"
                className="cursor-pointer select-none text-xs font-semibold text-neutral-700"
              >
                Feature this product
              </Label>
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
                  ? editingProduct !== null
                    ? "Saving..."
                    : "Creating..."
                  : editingProduct !== null
                    ? "Save Changes"
                    : "Create Product"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
