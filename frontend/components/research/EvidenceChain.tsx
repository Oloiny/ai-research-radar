import type { EvidenceItem } from "@/lib/types";
import { credibilityStyle } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface Props {
  evidence: EvidenceItem[];
}

export default function EvidenceChain({ evidence }: Props) {
  if (!evidence.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
        <span className="w-1 h-4 bg-brand-500 rounded-full" />
        证据链
        <span className="text-xs font-normal text-slate-400">({evidence.length} 个来源)</span>
      </h3>
      <div className="space-y-2">
        {evidence.map((ev) => {
          const style = credibilityStyle(ev.credibility);
          return (
            <div
              key={ev.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/80 border border-slate-100"
            >
              <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${style.color}`}>
                {ev.credibility.includes("原文已读") ? "✅" : "⚠️"} {style.label}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 leading-snug">
                  {ev.signal_title}
                </div>
                {ev.quote && (
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed italic">
                    &ldquo;{ev.quote}&rdquo;
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
                  {ev.signal_source && <span>{ev.signal_source}</span>}
                  {ev.signal_date && <span>{ev.signal_date}</span>}
                  {ev.signal_url && (
                    <a
                      href={ev.signal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-600"
                    >
                      原文 <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
