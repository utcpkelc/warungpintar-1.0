import {
  pgTable,
  text,
  timestamp,
  integer,
  numeric,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const saleStatusEnum = pgEnum("sale_status", [
  "completed",
  "pending",
  "cancelled",
  "refunded",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "qris",
  "transfer",
  "ewallet",
  "credit",
]);

export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "purchase",
  "sale",
  "adjustment",
  "return",
]);

/**
 * `owner_id` stores the Supabase Auth user UUID (as text). No FK to a local
 * `user` table — Supabase manages users in the `auth` schema.
 */
export const category = pgTable(
  "category",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    ownerNameIdx: uniqueIndex("category_owner_name_idx").on(
      table.ownerId,
      table.name,
    ),
  }),
);

export const product = pgTable(
  "product",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    categoryId: text("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    sku: text("sku"),
    name: text("name").notNull(),
    description: text("description"),
    unit: text("unit").notNull().default("pcs"),
    costPrice: numeric("cost_price", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    sellingPrice: numeric("selling_price", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    stock: integer("stock").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    ownerSkuIdx: uniqueIndex("product_owner_sku_idx").on(
      table.ownerId,
      table.sku,
    ),
    ownerNameIdx: index("product_owner_name_idx").on(
      table.ownerId,
      table.name,
    ),
  }),
);

export const customer = pgTable("customer", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sale = pgTable("sale", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  customerId: text("customer_id").references(() => customer.id, {
    onDelete: "set null",
  }),
  invoiceNumber: text("invoice_number").notNull(),
  status: saleStatusEnum("status").notNull().default("completed"),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("cash"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  discount: numeric("discount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  tax: numeric("tax", { precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  amountPaid: numeric("amount_paid", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const saleItem = pgTable("sale_item", {
  id: text("id").primaryKey(),
  saleId: text("sale_id")
    .notNull()
    .references(() => sale.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => product.id, {
    onDelete: "set null",
  }),
  productName: text("product_name").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stockMovement = pgTable("stock_movement", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  productId: text("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  type: stockMovementTypeEnum("type").notNull(),
  quantity: integer("quantity").notNull(),
  reference: text("reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;
export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;
export type Customer = typeof customer.$inferSelect;
export type NewCustomer = typeof customer.$inferInsert;
export type Sale = typeof sale.$inferSelect;
export type NewSale = typeof sale.$inferInsert;
export type SaleItem = typeof saleItem.$inferSelect;
export type NewSaleItem = typeof saleItem.$inferInsert;
export type StockMovement = typeof stockMovement.$inferSelect;
export type NewStockMovement = typeof stockMovement.$inferInsert;
