"use client";

/*
 * ---------------------------------------------------------
 * PRODUCTS TABLE ROW
 * ---------------------------------------------------------
 */

import { Badge } from "@/src/app/components/ui/badge";
import { Button } from "@/src/app/components/ui/button";
import { cn, safeImageSrc } from "@/src/app/lib/utils";
import { Edit2, Image as ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { formatCurrency, StockBadge, TD_CLASS } from "../components/admin-ui";
import { primaryImageOf, type Product } from "./types";

/* Thumbnails that 404 fall back to the placeholder icon. */
function ProductThumbnail({ product }: { product: Product }) {
  const [broken, setBroken] = useState(false);

  const image = primaryImageOf(product);

  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
      {image && !broken ? (
        <Image
          src={safeImageSrc(image.image_url)}
          alt={product.name}
          fill
          sizes="44px"
          className="object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <ImageIcon className="h-5 w-5 text-neutral-300" />
      )}
    </div>
  );
}

interface ProductRowProps {
  product: Product;
  deleting: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string) => void;
}

export function ProductRow({
  product,
  deleting,
  onEdit,
  onDelete,
}: ProductRowProps) {
  return (
    <tr className="transition-colors hover:bg-neutral-50/50">
      <td className={TD_CLASS}>
        <div className="flex items-center gap-3">
          <ProductThumbnail product={product} />

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

      <td className={cn(TD_CLASS, "text-neutral-600")}>
        {product.categories?.name ?? "Uncategorized"}
      </td>

      <td className={TD_CLASS}>
        {product.sale_price !== null ? (
          <div className="flex flex-col">
            <span className="font-bold text-[#FF3D6E]">
              {formatCurrency(product.sale_price)}
            </span>

            <span className="text-[10px] text-neutral-400 line-through">
              {formatCurrency(product.price)}
            </span>
          </div>
        ) : (
          <span className="font-bold text-neutral-800">
            {formatCurrency(product.price)}
          </span>
        )}
      </td>

      <td className={TD_CLASS}>
        <StockBadge stock={product.stock_quantity} />
      </td>

      <td className={TD_CLASS}>
        {product.featured ? (
          <Badge className="border-none bg-[#FF3D6E]/10 text-[9px] font-bold text-[#FF3D6E] hover:bg-[#FF3D6E]/15">
            FEATURED
          </Badge>
        ) : (
          <span className="text-xs text-neutral-300">-</span>
        )}
      </td>

      <td className={cn(TD_CLASS, "space-x-1 text-right")}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onEdit(product)}
          className="h-8 w-8 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={deleting}
          onClick={() => onDelete(product.id, product.name)}
          className="h-8 w-8 text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </td>
    </tr>
  );
}
