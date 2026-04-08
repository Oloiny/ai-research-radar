import Link from "next/link";
import { cn } from "@/lib/utils";

interface TagListProps {
  tags: string[];
  linkPrefix?: string;
  max?: number;
}

export default function TagList({ tags, linkPrefix, max }: TagListProps) {
  const visible = max ? tags.slice(0, max) : tags;
  const remaining = max ? tags.length - max : 0;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((tag) => {
        const classes = cn(
          "inline-block text-xs px-2 py-0.5 rounded-full transition",
          "bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
        );

        return linkPrefix ? (
          <Link key={tag} href={`${linkPrefix}?tag=${encodeURIComponent(tag)}`} className={classes}>
            {tag}
          </Link>
        ) : (
          <span key={tag} className={classes}>
            {tag}
          </span>
        );
      })}
      {remaining > 0 && (
        <span className="text-xs text-slate-400">+{remaining}</span>
      )}
    </div>
  );
}
