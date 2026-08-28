"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/app/lib/supabase/client";
import { generateDummyProducts } from "@/src/app/lib/dummy-data";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Checkbox } from "@/src/app/components/ui/checkbox";
import { Badge } from "@/src/app/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  SheetClose,
} from "@/src/app/components/ui/sheet";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PackageOpen,
  Image as ImageIcon,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  category_id: string;
  featured: boolean;
  categories?: {
    name?: string;
    slug?: string;
  } | null;
  product_images?: {
    image_url: string;
    is_primary: boolean;
  }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSandbox, setIsSandbox] = useState(false);
  const { toast } = useToast();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Form sheet state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formSalePrice, setFormSalePrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState("");

  const supabase = createClient();

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load categories
      const { data: catsData } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name", { ascending: true });
      
      const categoryList = catsData || [];
      setCategories(categoryList);

      // 2. Load products
      const { data: prodsData, error: prodsErr } = await supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          description,
          price,
          sale_price,
          stock_quantity,
          category_id,
          featured,
          categories:category_id(name, slug),
          product_images(image_url, is_primary)
        `)
        .order("created_at", { ascending: false });

      if (prodsErr) throw prodsErr;

      if (prodsData && prodsData.length > 0) {
        setIsSandbox(false);
        // Cast to required format
        const formattedProducts = prodsData.map((p) => ({
          ...p,
          price: Number(p.price),
          sale_price: p.sale_price ? Number(p.sale_price) : null,
          stock_quantity: Number(p.stock_quantity),
        }));
        setProducts(formattedProducts);
      } else {
        // No products in db yet, load mockup fallbacks
        throw new Error("No database listings");
      }
    } catch (err) {
      console.warn("Using sandbox mode for products CRUD:", err);
      setIsSandbox(true);

      // Mock Categories
      const mockCats = [
        { id: "men", name: "Men", slug: "men" },
        { id: "women", name: "Women", slug: "women" },
        { id: "kids", name: "Kids", slug: "kids" },
        { id: "footwear", name: "Footwear", slug: "footwear" },
        { id: "fragrance", name: "Fragrance", slug: "fragrance" },
        { id: "winter-wear", name: "Winter Wear", slug: "winter-wear" },
      ];
      setCategories(mockCats);

      // Generate dummy products
      const mockProds: Product[] = [];
      mockCats.forEach((cat) => {
        const dummy = generateDummyProducts(cat.slug, 3);
        dummy.forEach((p) => {
          mockProds.push({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description || "",
            price: Number(p.price),
            sale_price: p.sale_price ? Number(p.sale_price) : null,
            stock_quantity: Math.floor(Math.random() * 50),
            category_id: cat.id,
            featured: Math.random() > 0.7,
            categories: { name: cat.name, slug: cat.slug },
            product_images: p.product_images || [],
          });
        });
      });
      setProducts(mockProds);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync slug with name when creating a new product
  useEffect(() => {
    if (!editingProduct) {
      const generatedSlug = formName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormSlug(generatedSlug);
    }
  }, [formName, editingProduct]);

  // Open Form Sheet
  const handleOpenForm = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormName(product.name);
      setFormSlug(product.slug);
      setFormDescription(product.description || "");
      setFormPrice(product.price.toString());
      setFormSalePrice(product.sale_price ? product.sale_price.toString() : "");
      setFormStock(product.stock_quantity.toString());
      setFormCategoryId(product.category_id || "");
      setFormFeatured(product.featured || false);
      
      const primaryImg = product.product_images?.find((img) => img.is_primary);
      setFormImageUrl(primaryImg?.image_url || "");
    } else {
      setEditingProduct(null);
      setFormName("");
      setFormSlug("");
      setFormDescription("");
      setFormPrice("");
      setFormSalePrice("");
      setFormStock("");
      // Default to first category if available
      setFormCategoryId(categories[0]?.id || "");
      setFormFeatured(false);
      setFormImageUrl("");
    }
    setIsFormOpen(true);
  };

  // Form Submit Action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName || !formSlug || !formPrice || !formStock || !formCategoryId) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all mandatory fields.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: formName,
      slug: formSlug,
      description: formDescription,
      price: Number.parseFloat(formPrice),
      sale_price: formSalePrice ? Number.parseFloat(formSalePrice) : null,
      stock_quantity: Number.parseInt(formStock),
      category_id: formCategoryId,
      featured: formFeatured,
    };

    try {
      if (isSandbox) {
        // Local state changes for sandbox mock simulation
        const selectedCat = categories.find((c) => c.id === formCategoryId);
        
        if (editingProduct) {
          // Update product in local state
          const updated: Product = {
            ...editingProduct,
            ...payload,
            categories: selectedCat ? { name: selectedCat.name, slug: selectedCat.slug } : null,
            product_images: formImageUrl
              ? [{ image_url: formImageUrl, is_primary: true }]
              : editingProduct.product_images,
          };
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
          toast({ title: "Product Updated", description: "Successfully updated in Sandbox simulation mode." });
        } else {
          // Insert product in local state
          const newProd: Product = {
            id: `mock-prod-${Date.now()}`,
            ...payload,
            categories: selectedCat ? { name: selectedCat.name, slug: selectedCat.slug } : null,
            product_images: formImageUrl ? [{ image_url: formImageUrl, is_primary: true }] : [],
          };
          setProducts((prev) => [newProd, ...prev]);
          toast({ title: "Product Created", description: "Successfully added in Sandbox simulation mode." });
        }
      } else {
        // Real Supabase Actions
        if (editingProduct) {
          // UPDATE Product
          const { error: updateErr } = await supabase
            .from("products")
            .update(payload)
            .eq("id", editingProduct.id);

          if (updateErr) throw updateErr;

          // Update product images
          if (formImageUrl) {
            const { data: currentImgs } = await supabase
              .from("product_images")
              .select("id")
              .eq("product_id", editingProduct.id)
              .eq("is_primary", true);
            
            if (currentImgs && currentImgs.length > 0) {
              await supabase
                .from("product_images")
                .update({ image_url: formImageUrl })
                .eq("id", currentImgs[0].id);
            } else {
              await supabase
                .from("product_images")
                .insert([{ product_id: editingProduct.id, image_url: formImageUrl, is_primary: true }]);
            }
          }

          toast({ title: "Product Updated", description: `Product "${formName}" updated successfully.` });
        } else {
          // CREATE Product
          const { data: newProd, error: insertErr } = await supabase
            .from("products")
            .insert([payload])
            .select()
            .single();

          if (insertErr) throw insertErr;

          // Create product images
          if (formImageUrl && newProd) {
            await supabase
              .from("product_images")
              .insert([{ product_id: newProd.id, image_url: formImageUrl, is_primary: true }]);
          }

          toast({ title: "Product Created", description: `Product "${formName}" created successfully.` });
        }
        
        // Refresh catalog
        await loadData();
      }

      setIsFormOpen(false);
    } catch (err: unknown) {
      console.error(err);
      toast({
        title: "Operation Failed",
        description: err instanceof Error ? err.message : "An error occurred writing data.",
        variant: "destructive",
      });
    }
  };

  // Delete Action
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      if (isSandbox) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast({
          title: "Product Deleted",
          description: "Removed from sandbox state.",
        });
      } else {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
        toast({
          title: "Product Deleted",
          description: `Product "${name}" deleted successfully.`,
        });
        await loadData();
      }
    } catch (err: unknown) {
      console.error(err);
      toast({
        title: "Delete Failed",
        description: err instanceof Error ? err.message : "Could not delete product.",
        variant: "destructive",
      });
    }
  };

  // Filter and Search logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.slug.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === "low") {
      matchesStock = product.stock_quantity > 0 && product.stock_quantity < 10;
    } else if (stockFilter === "out") {
      matchesStock = product.stock_quantity === 0;
    } else if (stockFilter === "in") {
      matchesStock = product.stock_quantity >= 10;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border border-red-200 gap-1 flex w-fit items-center text-[10px] font-bold">
          <XCircle className="h-3 w-3 text-red-500" />
          Out of Stock
        </Badge>
      );
    }
    if (stock < 10) {
      return (
        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 gap-1 flex w-fit items-center text-[10px] font-bold">
          <AlertTriangle className="h-3 w-3 text-amber-500" />
          Low Stock ({stock})
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-200 gap-1 flex w-fit items-center text-[10px] font-bold">
        <CheckCircle className="h-3 w-3 text-green-500" />
        In Stock ({stock})
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">Products</h1>
          <p className="text-sm text-neutral-500">
            Create, update, and manage your inventory items.
          </p>
        </div>
        <Button
          onClick={() => handleOpenForm(null)}
          className="bg-[#FF3D6E] hover:bg-[#E0345F] text-white flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-neutral-200"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-48">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="border-neutral-200">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stock Status Filter */}
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

      {/* Products Table Card */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center animate-pulse">
                  <div className="h-10 w-10 bg-neutral-200 rounded"></div>
                  <div className="h-4 w-40 bg-neutral-200 rounded"></div>
                  <div className="h-4 w-20 bg-neutral-200 rounded"></div>
                  <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-400">
              <PackageOpen className="h-12 w-12 text-neutral-300 mb-3" />
              <p className="text-sm font-semibold">No products match your search/filters.</p>
              <p className="text-xs text-neutral-400 mt-1">Try resetting filters or adding a new product listing.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/55 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold">Price</th>
                  <th className="px-6 py-3 font-semibold">Stock</th>
                  <th className="px-6 py-3 font-semibold">Featured</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {filteredProducts.map((product) => {
                  const primaryImg = product.product_images?.find((img) => img.is_primary) || product.product_images?.[0];
                  
                  return (
                    <tr key={product.id} className="hover:bg-neutral-50/30 transition-colors">
                      {/* Product details cell */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50 overflow-hidden">
                            {primaryImg ? (
                              <img
                                src={primaryImg.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  // Hide broken image
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-neutral-300" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-800 leading-tight">
                              {product.name}
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category cell */}
                      <td className="px-6 py-4 text-neutral-600">
                        {product.categories?.name || "Uncategorized"}
                      </td>

                      {/* Price cell */}
                      <td className="px-6 py-4">
                        {product.sale_price ? (
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

                      {/* Stock Level badge cell */}
                      <td className="px-6 py-4">
                        {getStockBadge(product.stock_quantity)}
                      </td>

                      {/* Featured checkbox/badge cell */}
                      <td className="px-6 py-4">
                        {product.featured ? (
                          <Badge className="bg-[#FF3D6E]/10 text-[#FF3D6E] hover:bg-[#FF3D6E]/15 border-none font-bold text-[9px]">
                            FEATURED
                          </Badge>
                        ) : (
                          <span className="text-neutral-300 text-xs">-</span>
                        )}
                      </td>

                      {/* Actions cell */}
                      <td className="px-6 py-4 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenForm(product)}
                          className="h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id, product.name)}
                          className="h-8 w-8 text-neutral-400 hover:text-red-600 hover:bg-red-50"
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

      {/* Slide-out Create/Edit Sheet Form */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-white">
          <SheetHeader className="border-b pb-4 mb-6">
            <SheetTitle className="text-lg font-bold text-neutral-900">
              {editingProduct ? `Edit Product: ${editingProduct.name}` : "Create New Product"}
            </SheetTitle>
            <SheetDescription className="text-xs text-neutral-400">
              Fill in the parameters below. Changes are saved instantly.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pr-1">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="form-name" className="text-xs font-bold text-neutral-700">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="form-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Mens Casual Polo"
                required
                className="border-neutral-200"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label htmlFor="form-slug" className="text-xs font-bold text-neutral-700">
                Product Slug <span className="text-red-500">*</span>
              </Label>
              <Input
                id="form-slug"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="mens-casual-polo"
                required
                className="font-mono text-xs border-neutral-200"
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="form-category" className="text-xs font-bold text-neutral-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                <SelectTrigger className="border-neutral-200">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price & Sale Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="form-price" className="text-xs font-bold text-neutral-700">
                  Price (Rs.) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="form-price"
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="e.g. 2500"
                  required
                  className="border-neutral-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="form-sale-price" className="text-xs font-bold text-neutral-700">
                  Sale Price (Rs.)
                </Label>
                <Input
                  id="form-sale-price"
                  type="number"
                  value={formSalePrice}
                  onChange={(e) => setFormSalePrice(e.target.value)}
                  placeholder="Optional discount"
                  className="border-neutral-200"
                />
              </div>
            </div>

            {/* Stock Quantity */}
            <div className="space-y-1.5">
              <Label htmlFor="form-stock" className="text-xs font-bold text-neutral-700">
                Stock Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="form-stock"
                type="number"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                placeholder="e.g. 50"
                required
                className="border-neutral-200"
              />
            </div>

            {/* Primary Image URL */}
            <div className="space-y-1.5">
              <Label htmlFor="form-image" className="text-xs font-bold text-neutral-700">
                Primary Image URL
              </Label>
              <Input
                id="form-image"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or /placeholder.svg"
                className="border-neutral-200"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="form-desc" className="text-xs font-bold text-neutral-700">
                Description
              </Label>
              <Textarea
                id="form-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe features, fabric composition, fit details..."
                rows={3}
                className="border-neutral-200"
              />
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="form-featured"
                checked={formFeatured}
                onCheckedChange={(checked) => setFormFeatured(checked === true)}
              />
              <Label
                htmlFor="form-featured"
                className="text-xs font-semibold text-neutral-700 cursor-pointer select-none"
              >
                Feature this product on the main homepage carousel
              </Label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6 border-t mt-8">
              <SheetClose asChild>
                <Button type="button" variant="outline" className="flex-1 border-neutral-300 text-neutral-600">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" className="flex-1 bg-[#FF3D6E] hover:bg-[#E0345F] text-white">
                {editingProduct ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
