import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  baseUrl: string;
}

function pageHref(baseUrl: string, page: number): string {
  const url = new URL(baseUrl, "http://placeholder");
  url.searchParams.set("page", String(page));
  return `${url.pathname}?${url.searchParams.toString()}`;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}

export default function Pagination({ page, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  const btnBase = "inline-flex items-center justify-center rounded-md text-sm h-8 min-w-[2rem] px-2 transition";

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="分页导航">
      {page > 1 ? (
        <Link href={pageHref(baseUrl, page - 1)} className={cn(btnBase, "text-slate-600 hover:bg-slate-100")}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(btnBase, "text-slate-300 cursor-not-allowed")}>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className={cn(btnBase, "text-slate-400 cursor-default")}>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(baseUrl, p)}
            className={cn(
              btnBase,
              p === page
                ? "bg-brand-500 text-white font-medium"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={pageHref(baseUrl, page + 1)} className={cn(btnBase, "text-slate-600 hover:bg-slate-100")}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(btnBase, "text-slate-300 cursor-not-allowed")}>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
