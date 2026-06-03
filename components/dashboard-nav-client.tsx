"use client";

import { usePathname } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";

export function DashboardNavClient() {
  const pathname = usePathname();
  return <DashboardNav pathname={pathname} />;
}
