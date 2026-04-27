"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = { id: string; name: string };

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    categoryId: "",
    unit: "pcs",
    costPrice: "0",
    sellingPrice: "0",
    stock: "0",
    lowStockThreshold: "5",
  });

  useEffect(() => {
    fetch("/api/categories", { cache: "no-store" })
      .then((res) => res.json())
      .then((j) => setCategories(j.items ?? []))
      .catch(() => undefined);
  }, []);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku || null,
          description: form.description || null,
          categoryId: form.categoryId || null,
          unit: form.unit,
          costPrice: Number(form.costPrice),
          sellingPrice: Number(form.sellingPrice),
          stock: Number(form.stock),
          lowStockThreshold: Number(form.lowStockThreshold),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error || "Failed to create product");
        return;
      }
      toast.success("Product created");
      router.push("/dashboard/products");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div>
        <h2 className="text-2xl font-semibold">Add product</h2>
        <p className="text-sm text-muted-foreground">
          Create a new item to sell from your shop
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Product details</CardTitle>
            <CardDescription>
              Set name, pricing, and starting stock
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Indomie Goreng"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={form.unit}
                onChange={(e) => update("unit", e.target.value)}
                placeholder="pcs, kg, pack"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.categoryId || "none"}
                onValueChange={(v) =>
                  update("categoryId", v === "none" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost price (Rp)</Label>
              <Input
                id="costPrice"
                type="number"
                min={0}
                value={form.costPrice}
                onChange={(e) => update("costPrice", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling price (Rp)</Label>
              <Input
                id="sellingPrice"
                type="number"
                min={0}
                value={form.sellingPrice}
                onChange={(e) => update("sellingPrice", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low stock threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min={0}
                value={form.lowStockThreshold}
                onChange={(e) => update("lowStockThreshold", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 flex gap-2">
          <Button type="submit" disabled={submitting || !form.name}>
            {submitting ? "Creating…" : "Create product"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
