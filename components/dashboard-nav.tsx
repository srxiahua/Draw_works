import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "投递", match: (p: string) => p === "/dashboard" },
  { href: "/dashboard/archive", label: "档案", match: (p: string) => p.startsWith("/dashboard/archive") },
  { href: "/dashboard/dna", label: "DNA", match: (p: string) => p.startsWith("/dashboard/dna") || p.startsWith("/dashboard/insights") },
];

export function DashboardNav({ pathname }: { pathname: string }) {
  return (
    <div className="mb-8 flex flex-wrap gap-1 border-b border-pink-300/15 pb-4">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm transition",
            l.match(pathname)
              ? "bg-pink-500/20 text-pink-100 ring-1 ring-pink-400/30"
              : "text-zinc-400 hover:bg-white/5 hover:text-white"
          )}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
