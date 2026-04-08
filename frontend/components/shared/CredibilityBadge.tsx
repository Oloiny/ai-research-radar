import { cn, credibilityStyle } from "@/lib/utils";

interface CredibilityBadgeProps {
  credibility: string;
}

export default function CredibilityBadge({ credibility }: CredibilityBadgeProps) {
  const style = credibilityStyle(credibility);
  const icon = style.label.includes("原文已读") ? "✅" : "⚠️";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        style.color
      )}
    >
      <span>{icon}</span>
      {style.label}
    </span>
  );
}
