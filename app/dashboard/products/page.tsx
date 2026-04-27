"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  costPrice: string;
  sellingPrice: string;
  stock: number;
  lowStockThreshold: number;
  categoryId: string | null;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const url = search
        ? `/api/products?search=${encodeURIComponent(search)}`
        : "/api/products";
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      setProducts(json.items ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Product deleted");
      load();
    } else {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error || "Failed to delete");
    }
  }

  const totals = useMemo(() => {
    const stockValue = products.reduce(
      (sum, p) => sum + p.stock * Number(p.costPrice),
      0,
    );
    const low = products.filter((p) => p.stock <= p.lowStockThreshold).length;
    return { stockValue, low };
  }, [products]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Products</h2>
          <p className="text-sm text-muted-foreground">
            {products.length} items · stock value{" "}
            {formatCurrency(totals.stockValue)} · {totals.low} low stock
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <IconPlus className="size-4" />
            Add product
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU…"
          className="pl-9"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>Manage products and stock levels</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      <div className="text-muted-foreground">
                        No products yet.
                      </div>
                      <Button asChild size="sm" className="mt-3">
                        <Link href="/dashboard/products/new">
                          Add your first product
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => {
                    const isLow = p.stock <= p.lowStockThreshold;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.sku || "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(p.costPrice)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(p.sellingPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={isLow ? "destructive" : "secondary"}>
                            {p.stock} {p.unit}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(p.id)}
                            aria-label="Delete product"
                          >
                            <IconTrash className="size-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
