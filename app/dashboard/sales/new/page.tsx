"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconMinus,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
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
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  sellingPrice: string;
  stock: number;
};

type Customer = { id: string; name: string };

type CartItem = {
  productId: string;
  name: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

const PAYMENT_METHODS: Array<{
  value: "cash" | "qris" | "transfer" | "ewallet" | "credit";
  label: string;
}> = [
  { value: "cash", label: "Cash" },
  { value: "qris", label: "QRIS" },
  { value: "transfer", label: "Bank Transfer" },
  { value: "ewallet", label: "E-Wallet" },
  { value: "credit", label: "Credit (Hutang)" },
];

export default function NewSalePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<string>("none");
  const [paymentMethod, setPaymentMethod] =
    useState<(typeof PAYMENT_METHODS)[number]["value"]>("cash");
  const [discount, setDiscount] = useState("0");
  const [tax, setTax] = useState("0");
  const [amountPaid, setAmountPaid] = useState("0");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((j) => setProducts(j.items ?? []))
      .catch(() => undefined);
    fetch("/api/customers", { cache: "no-store" })
      .then((res) => res.json())
      .then((j) => setCustomers(j.items ?? []))
      .catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products.slice(0, 24);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku ?? "").toLowerCase().includes(q),
      )
      .slice(0, 24);
  }, [products, search]);

  function addToCart(p: Product) {
    if (p.stock <= 0) {
      toast.error(`${p.name} is out of stock`);
      return;
    }
    setCart((curr) => {
      const existing = curr.find((c) => c.productId === p.id);
      if (existing) {
        if (existing.quantity >= p.stock) {
          toast.error(`Only ${p.stock} ${p.unit} available`);
          return curr;
        }
        return curr.map((c) =>
          c.productId === p.id
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        );
      }
      return [
        ...curr,
        {
          productId: p.id,
          name: p.name,
          unit: p.unit,
          unitPrice: Number(p.sellingPrice),
          quantity: 1,
          maxStock: p.stock,
        },
      ];
    });
  }

  function changeQty(productId: string, delta: number) {
    setCart((curr) =>
      curr
        .map((c) => {
          if (c.productId !== productId) return c;
          const next = Math.max(0, Math.min(c.maxStock, c.quantity + delta));
          return { ...c, quantity: next };
        })
        .filter((c) => c.quantity > 0),
    );
  }

  function removeFromCart(productId: string) {
    setCart((curr) => curr.filter((c) => c.productId !== productId));
  }

  const subtotal = useMemo(
    () => cart.reduce((sum, c) => sum + c.unitPrice * c.quantity, 0),
    [cart],
  );
  const discountNum = Number(discount) || 0;
  const taxNum = Number(tax) || 0;
  const total = Math.max(0, subtotal - discountNum + taxNum);
  const paid = Number(amountPaid) || 0;
  const change = paid - total;

  useEffect(() => {
    setAmountPaid(total.toString());
  }, [total]);

  async function handleSubmit() {
    if (cart.length === 0) {
      toast.error("Add at least one product");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId === "none" ? null : customerId,
          paymentMethod,
          discount: discountNum,
          tax: taxNum,
          amountPaid: paid,
          notes: notes || null,
          items: cart.map((c) => ({
            productId: c.productId,
            quantity: c.quantity,
            unitPrice: c.unitPrice,
          })),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error || "Failed to create sale");
        return;
      }
      const json = await res.json();
      toast.success(`Sale ${json.sale.invoiceNumber} recorded`);
      router.push(`/dashboard/sales/${json.sale.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div>
        <h2 className="text-2xl font-semibold">New sale</h2>
        <p className="text-sm text-muted-foreground">
          Record a transaction from your shop
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Click an item to add to cart</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative max-w-md">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {filtered.length === 0 ? (
                <div className="col-span-full py-6 text-center text-sm text-muted-foreground">
                  No products found.
                </div>
              ) : (
                filtered.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => addToCart(p)}
                    disabled={p.stock <= 0}
                    className="flex flex-col items-start gap-1 rounded-lg border bg-card p-3 text-left text-sm shadow-xs transition hover:border-primary hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="line-clamp-2 font-medium">{p.name}</span>
                    <span className="tabular-nums">
                      {formatCurrency(p.sellingPrice)}
                    </span>
                    <Badge
                      variant={p.stock > 0 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {p.stock} {p.unit}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cart</CardTitle>
            <CardDescription>{cart.length} items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No items yet. Add products from the left.
              </div>
            ) : (
              <ul className="space-y-2">
                {cart.map((c) => (
                  <li
                    key={c.productId}
                    className="flex items-center justify-between gap-2 rounded-md border p-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium leading-tight line-clamp-1">
                        {c.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(c.unitPrice)} ·{" "}
                        {formatCurrency(c.unitPrice * c.quantity)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7"
                        onClick={() => changeQty(c.productId, -1)}
                      >
                        <IconMinus className="size-3" />
                      </Button>
                      <span className="w-8 text-center text-sm tabular-nums">
                        {c.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7"
                        onClick={() => changeQty(c.productId, 1)}
                      >
                        <IconPlus className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => removeFromCart(c.productId)}
                      >
                        <IconTrash className="size-3 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-3 border-t pt-4">
              <div className="space-y-2">
                <Label>Customer (optional)</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Walk-in customer</SelectItem>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v) =>
                    setPaymentMethod(v as typeof paymentMethod)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (Rp)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax (Rp)</Label>
                  <Input
                    id="tax"
                    type="number"
                    min={0}
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amountPaid">Amount paid (Rp)</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  min={0}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="tabular-nums">
                  −{formatCurrency(discountNum)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="tabular-nums">{formatCurrency(taxNum)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(total)}</span>
              </div>
              {paid > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Change</span>
                  <span
                    className={`tabular-nums ${change < 0 ? "text-destructive" : ""}`}
                  >
                    {formatCurrency(change)}
                  </span>
                </div>
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={submitting || cart.length === 0}
            >
              {submitting ? "Recording…" : "Complete sale"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
