import { cn, trendStatusInfo } from "@/lib/utils";

interface TrendStatusBadgeProps {
  status: string;
  className?: string;
}

export default function TrendStatusBadge({
  status,
  className,
}: TrendStatusBadgeProps) {
  const info = trendStatusInfo(status);

  return (
    <span
      className={cn(
        "text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1",
        info.color,
        className
      )}
    >
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </span>
  );
}
