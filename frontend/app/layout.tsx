import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Research Radar — AI 领域深度研究平台",
  description: "结构化的 AI 深度研究、趋势追踪与领域全景。不是新闻聚合，是可验证的研究报告。",
  openGraph: {
    title: "AI Research Radar",
    description: "AI 领域的深度研究图书馆",
    type: "website",
  },
};

const NAV_LINKS = [
  { href: "/research", label: "深度研究" },
  { href: "/trends", label: "趋势雷达" },
  { href: "/domains", label: "领域地图" },
  { href: "/about", label: "方法论" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
              <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 text-lg tracking-tight">
                <span className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center text-sm">R</span>
                <span>AI Research Radar</span>
              </Link>
              <nav className="flex items-center gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          {/* Main */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200/60 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-brand-500 text-white flex items-center justify-center text-[10px] font-bold">R</span>
                  <span>AI Research Radar</span>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/about" className="hover:text-slate-600 transition-colors">方法论</Link>
                  <span>·</span>
                  <span>22+ 信源 · 6 维评分 · 语义趋势追踪</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
