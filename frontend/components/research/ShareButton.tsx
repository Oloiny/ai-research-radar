"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
    >
      {copied ? <Check size={12} className="text-emerald-500" /> : <Link2 size={12} />}
      {copied ? "已复制" : "复制链接"}
    </button>
  );
}
