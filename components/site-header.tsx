import Link from "next/link";

const NAV = [
  { href: "/", label: "首页" },
  { href: "/#gallery", label: "画廊" },
  { href: "/#upload", label: "上传" },
  { href: "/#diagnosis", label: "AI诊断" },
  { href: "/dashboard/dna", label: "DNA" },
  { href: "/gallery", label: "展柜" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-pink-300/20 bg-[#1a0f24]/88 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-display text-xl tracking-wide">
          <span className="bg-gradient-to-r from-pink-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">
            DrawWorks
          </span>
          <span className="ml-1.5 text-base">🐰</span>
        </Link>
        <nav className="flex items-center gap-0.5 overflow-x-auto text-sm sm:gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="whitespace-nowrap rounded-full px-2.5 py-1 text-zinc-300 transition hover:bg-pink-500/15 hover:text-pink-100 sm:px-3"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
