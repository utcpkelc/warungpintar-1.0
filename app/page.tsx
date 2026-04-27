"use client";

import {
  IconBox,
  IconBuildingStore,
  IconChartBar,
  IconCash,
  IconShoppingCart,
  IconUsers,
} from "@tabler/icons-react";

import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButtons, HeroAuthButtons } from "@/components/auth-buttons";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center py-12 sm:py-16 relative px-4">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <AuthButtons />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg">
            <IconBuildingStore className="size-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-500 bg-clip-text text-transparent font-parkinsans">
            Warung Pintar
          </h1>
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 mb-8">
          A modern point-of-sale and inventory app for small shops — manage
          products, record sales, and grow with confidence.
        </p>

        <HeroAuthButtons />
      </div>

      <main className="container mx-auto px-4 sm:px-6 pb-12 sm:pb-8 max-w-5xl">
        <div className="text-center mb-8">
          <div className="font-bold text-lg sm:text-xl mb-2">
            Everything your warung needs
          </div>
          <div className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            From the front counter to back-office reports, Warung Pintar keeps
            your shop running smoothly.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <FeatureCard
            icon={<IconShoppingCart className="size-6 text-emerald-600" />}
            title="Fast point of sale"
            tone="from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 border-emerald-200/50 dark:border-emerald-700/30"
            items={[
              "Add to cart in two taps",
              "QRIS, cash, transfer, e-wallet",
              "Auto-generated invoices",
              "Real-time stock deduction",
            ]}
          />
          <FeatureCard
            icon={<IconBox className="size-6 text-amber-600" />}
            title="Smart inventory"
            tone="from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 border-amber-200/50 dark:border-amber-700/30"
            items={[
              "Track cost and selling price",
              "Low stock alerts",
              "SKUs and categories",
              "Stock movement history",
            ]}
          />
          <FeatureCard
            icon={<IconUsers className="size-6 text-blue-600" />}
            title="Customer book"
            tone="from-blue-50 to-sky-50 dark:from-blue-900/10 dark:to-sky-900/10 border-blue-200/50 dark:border-blue-700/30"
            items={[
              "Save phone and address",
              "Search and filter",
              "Link to past sales",
              "Notes per customer",
            ]}
          />
          <FeatureCard
            icon={<IconChartBar className="size-6 text-purple-600" />}
            title="Reports that matter"
            tone="from-purple-50 to-fuchsia-50 dark:from-purple-900/10 dark:to-fuchsia-900/10 border-purple-200/50 dark:border-purple-700/30"
            items={[
              "Daily / monthly revenue",
              "30-day trends",
              "Top selling products",
              "Restock recommendations",
            ]}
          />
          <FeatureCard
            icon={<IconCash className="size-6 text-rose-600" />}
            title="Money under control"
            tone="from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 border-rose-200/50 dark:border-rose-700/30"
            items={[
              "Discounts and tax",
              "Change calculation",
              "Multi-payment methods",
              "Credit (hutang) tracking",
            ]}
          />
          <FeatureCard
            icon={<IconBuildingStore className="size-6 text-indigo-600" />}
            title="Built for warungs"
            tone="from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10 border-indigo-200/50 dark:border-indigo-700/30"
            items={[
              "Rupiah currency formatting",
              "Indonesian payment options",
              "Mobile-friendly POS",
              "Secure per-account data",
            ]}
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  items,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  tone: string;
}) {
  return (
    <Card className={`p-4 sm:p-6 bg-gradient-to-br ${tone}`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((it) => (
          <li key={it}>• {it}</li>
        ))}
      </ul>
    </Card>
  );
}
