import { cn, scoreColor } from "@/lib/utils";

const sizeMap = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-sm px-2 py-0.5",
  lg: "text-base px-2.5 py-1",
} as const;

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold",
        sizeMap[size],
        scoreColor(score)
      )}
    >
      {score.toFixed(1)}
    </span>
  );
}
