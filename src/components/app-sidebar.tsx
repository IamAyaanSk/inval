"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  KeyRound,
  CircleQuestionMark,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Documents",
    url: "/dashboard/documents",
    icon: FileText,
  },
  {
    title: "API Keys",
    url: "/dashboard/api-keys",
    icon: KeyRound,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex flex-col gap-1.5 px-2 py-2">
          <h1 className="tracking-[0.4rem] uppercase text-foreground">Inval</h1>
          <p className="font-semibold">A Really Awesome Corp.</p>
        </div>
      </SidebarHeader>
      <SidebarContent className="mt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.url === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.url ||
                      pathname?.startsWith(`${item.url}/`);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-0 pb-8 pt-4 border-t-2 border-foreground/10">
        <SidebarMenu>
          <SidebarMenuItem className="flex gap-2 text-foreground items-center justify-center font-semibold">
            <CircleQuestionMark className="items-start" size={20} />
            <span className="text-sm">Your Support Team</span>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
