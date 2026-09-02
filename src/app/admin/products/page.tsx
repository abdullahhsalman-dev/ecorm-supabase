"use client";

/*
 * ---------------------------------------------------------
 * ADMIN / PRODUCTS
 * ---------------------------------------------------------
 *
 * Composition only. The data lives in use-products, the write
 * paths in queries.ts, and the sheets own their own state.
 */

import { Button } from "@/src/app/components/ui/button";
import { cn } from "@/src/app/lib/utils";
import { PackageOpen, Plus, Upload } from "lucide-react";
import { useState } from "react";
import {
  DataPanel,
  FILTER_BAR_CLASS,
  FilterSelect,
  LOW_STOCK_THRESHOLD,
  PageHeader,
  PRIMARY_BUTTON_CLASS,
  RefreshButton,
  SearchInput,
} from "../components/admin-ui";
import { ProductImportSheet } from "./import-sheet";
import { ProductFormSheet } from "./product-form-sheet";
import { ProductRow } from "./product-row";
import type { Product, StockFilter } from "./types";
import { useProducts } from "./use-products";

const PRODUCT_COLUMNS = [
  { key: "product", label: "Product" },
  { key: "category", label: "Category" },
  { key: "price", label: "Price" },
  { key: "stock", label: "Stock" },
  { key: "featured", label: "Featured" },
  { key: "actions", label: "Actions", align: "right" as const },
];

const STOCK_OPTIONS = [
  { value: "in", label: `In Stock (${LOW_STOCK_THRESHOLD}+)` },
  { value: "low", label: `Low Stock (<${LOW_STOCK_THRESHOLD})` },
  { value: "out", label: "Out of Stock (0)" },
];

export default function AdminProductsPage() {
  const {
    products,
    categories,
    filteredProducts,
    loading,
    deletingId,
    loadData,
    removeProduct,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    stockFilter,
    setStockFilter,
  } = useProducts();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const openForm = (product: Product | null): void => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean): void => {
    setIsFormOpen(open);

    if (!open) {
      setEditingProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Create, update, and manage your inventory items."
      >
        <RefreshButton onClick={loadData} loading={loading} />

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsImportOpen(true)}
          disabled={loading}
          className="flex items-center gap-2 border-neutral-300 text-neutral-700"
        >
          <Upload className="h-4 w-4" />
          Bulk Import
        </Button>

        <Button
          type="button"
          onClick={() => openForm(null)}
          className={cn("flex items-center gap-2", PRIMARY_BUTTON_CLASS)}
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </PageHeader>

      <div className={FILTER_BAR_CLASS}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name or slug..."
        />

        <FilterSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          allLabel="All Categories"
          options={categories.map((category) => ({
            value: category.id,
            label: category.name,
          }))}
        />

        <FilterSelect
          value={stockFilter}
          onChange={(value) => setStockFilter(value as StockFilter)}
          allLabel="All Stock Status"
          options={STOCK_OPTIONS}
        />
      </div>

      <DataPanel
        loading={loading}
        rows={filteredProducts}
        totalRows={products.length}
        columns={PRODUCT_COLUMNS}
        emptyIcon={PackageOpen}
        emptyTitle="No products yet."
        emptyDescription="Create your first product to start selling."
        filteredTitle="No products match your filters."
        filteredDescription="Try changing your filters or create a new product."
        renderRow={(product) => (
          <ProductRow
            key={product.id}
            product={product}
            deleting={deletingId === product.id}
            onEdit={openForm}
            onDelete={removeProduct}
          />
        )}
      />

      <ProductImportSheet
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        categories={categories}
        existingProducts={products}
        onImported={loadData}
      />

      <ProductFormSheet
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        product={editingProduct}
        categories={categories}
        existingProducts={products}
        onSaved={loadData}
      />
    </div>
  );
}
