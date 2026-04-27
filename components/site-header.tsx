"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/products": "Products",
  "/dashboard/products/new": "New Product",
  "/dashboard/categories": "Categories",
  "/dashboard/sales": "Sales",
  "/dashboard/sales/new": "New Sale",
  "/dashboard/customers": "Customers",
  "/dashboard/reports": "Reports",
};

export function SiteHeader() {
  const pathname = usePathname() || "/dashboard";
  const title =
    TITLES[pathname] ||
    (pathname.startsWith("/dashboard/products/")
      ? "Product Detail"
      : pathname.startsWith("/dashboard/sales/")
        ? "Sale Detail"
        : "Dashboard");

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
