import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format ISO date → "2026年3月27日" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** Format ISO date → "3/27" */
export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** Score → color class */
export function scoreColor(score: number): string {
  if (score >= 9.0) return "text-red-600 bg-red-50";
  if (score >= 8.0) return "text-orange-600 bg-orange-50";
  if (score >= 7.0) return "text-amber-600 bg-amber-50";
  return "text-slate-600 bg-slate-100";
}

/** Score → border color */
export function scoreBorderColor(score: number): string {
  if (score >= 9.0) return "border-red-200";
  if (score >= 8.0) return "border-orange-200";
  if (score >= 7.0) return "border-amber-200";
  return "border-slate-200";
}

/** Trend status → label + color */
export function trendStatusInfo(status: string): { label: string; color: string; icon: string } {
  const map: Record<string, { label: string; color: string; icon: string }> = {
    rising: { label: "上升中", color: "text-red-600 bg-red-50", icon: "🔥" },
    emerging: { label: "新兴", color: "text-violet-600 bg-violet-50", icon: "📈" },
    stable: { label: "稳定", color: "text-blue-600 bg-blue-50", icon: "➡️" },
    cooling: { label: "降温", color: "text-slate-500 bg-slate-100", icon: "❄️" },
    dormant: { label: "沉寂", color: "text-slate-400 bg-slate-50", icon: "💤" },
  };
  return map[status] || map.stable;
}

/** Credibility → badge style */
export function credibilityStyle(credibility: string): { label: string; color: string } {
  if (credibility.includes("原文已读") && credibility.includes("多源")) {
    return { label: "原文已读·多源", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  }
  if (credibility.includes("原文已读")) {
    return { label: "原文已读", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  }
  if (credibility.includes("标题推断")) {
    return { label: "标题推断", color: "text-amber-700 bg-amber-50 border-amber-200" };
  }
  return { label: credibility, color: "text-slate-600 bg-slate-50 border-slate-200" };
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/** Momentum → label */
export function momentumLabel(m: string): string {
  const map: Record<string, string> = {
    rising: "🔥 活跃",
    stable: "➡️ 稳定",
    cooling: "❄️ 冷却",
  };
  return map[m] || m;
}
