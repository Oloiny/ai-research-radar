"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface FilterBarProps {
  domains: Array<{ slug: string; name: string }>;
  currentDomain?: string;
  currentSort?: string;
  baseUrl: string;
}

const sortOptions = [
  { value: "newest", label: "最新" },
  { value: "score", label: "评分" },
] as const;

function buildHref(baseUrl: string, domain?: string, sort?: string): string {
  const params = new URLSearchParams();
  if (domain) params.set("domain", domain);
  if (sort) params.set("sort", sort);
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

export default function FilterBar({
  domains,
  currentDomain,
  currentSort = "newest",
  baseUrl,
}: FilterBarProps) {
  const [sortOpen, setSortOpen] = useState(false);

  const chipBase =
    "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap";

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Domain chips */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <Link
          href={buildHref(baseUrl, undefined, currentSort)}
          className={cn(
            chipBase,
            !currentDomain
              ? "bg-brand-500 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          全部
        </Link>
        {domains.map((d) => (
          <Link
            key={d.slug}
            href={buildHref(baseUrl, d.slug, currentSort)}
            className={cn(
              chipBase,
              currentDomain === d.slug
                ? "bg-brand-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {d.name}
          </Link>
        ))}
      </div>

      {/* Sort dropdown */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {sortOptions.find((o) => o.value === currentSort)?.label ?? "排序"}
        </button>

        {sortOpen && (
          <div className="absolute right-0 top-full z-10 mt-1 w-28 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            {sortOptions.map((opt) => (
              <Link
                key={opt.value}
                href={buildHref(baseUrl, currentDomain, opt.value)}
                onClick={() => setSortOpen(false)}
                className={cn(
                  "block w-full px-3 py-1.5 text-sm text-left transition",
                  currentSort === opt.value
                    ? "bg-brand-50 text-brand-600 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
