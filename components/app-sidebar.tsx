"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconDashboard,
  IconBox,
  IconCategory,
  IconUsers,
  IconShoppingCart,
  IconReportAnalytics,
  IconSettings,
  IconHelp,
  IconBuildingStore,
} from "@tabler/icons-react";
import { useSupabaseSession } from "@/hooks/use-supabase-session";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const staticData = {
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Products", url: "/dashboard/products", icon: IconBox },
    { title: "Categories", url: "/dashboard/categories", icon: IconCategory },
    { title: "Sales (POS)", url: "/dashboard/sales", icon: IconShoppingCart },
    { title: "Customers", url: "/dashboard/customers", icon: IconUsers },
    { title: "Reports", url: "/dashboard/reports", icon: IconReportAnalytics },
  ],
  navSecondary: [
    { title: "Settings", url: "#", icon: IconSettings },
    { title: "Help", url: "#", icon: IconHelp },
  ],
};

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = useSupabaseSession();

  const userData = user
    ? {
        name: user.name || "User",
        email: user.email || "",
        avatar: user.image || "/codeguide-logo.png",
      }
    : {
        name: "Guest",
        email: "guest@example.com",
        avatar: "/codeguide-logo.png",
      };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <IconBuildingStore className="!size-6 text-primary" />
                <span className="text-base font-semibold font-parkinsans">
                  Warung Pintar
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain} />
        <NavSecondary items={staticData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
