import { Lightbulb } from "lucide-react";

interface Props {
  direction: string;
}

export default function ResearchDirection({ direction }: Props) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-brand-50 to-blue-50 border border-brand-100 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb size={16} className="text-brand-500" />
        <h3 className="text-sm font-semibold text-brand-700">研究方向建议</h3>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">{direction}</p>
    </div>
  );
}
