import { DashboardNavClient } from "@/components/dashboard-nav-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <DashboardNavClient />
      {children}
    </div>
  );
}
