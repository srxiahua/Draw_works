import type { Metadata } from "next";
import { Noto_Sans_SC, ZCOOL_KuaiLe } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const noto = Noto_Sans_SC({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const display = ZCOOL_KuaiLe({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "DrawWorks — 二次元创作手帐",
    template: "%s | DrawWorks",
  },
  description:
    "二次元创作者的个人 sketchbook：投递作品、AI 解析风格 DNA、记录成长轨迹。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${noto.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-pink-300/10 py-6 text-center text-xs text-zinc-500">
          DrawWorks · 你的创作手帐 · AI 分析仅供参考
        </footer>
      </body>
    </html>
  );
}
