import { Fish } from "@/components/ui/Fish";
import { fish } from "@/utils/plural";

interface FishTallyProps {
  count: number;
  max?: number;
  className?: string;
}

export function FishTally({ count, max = 8, className = "" }: FishTallyProps) {
  const shown = Math.min(count, max);
  const rest = count - shown;

  return (
    <span className={`flex items-center gap-1 ${className}`} title={fish(count)}>
      {Array.from({ length: shown }, (_, index) => (
        <Fish key={index} className="w-4 shrink-0" tone="koi" />
      ))}
      {rest > 0 ? <span className="display text-xs text-ink/70">+{rest}</span> : null}
      {count === 0 ? (
        <span className="display text-[0.65rem] uppercase tracking-wider text-ink/40">limpo</span>
      ) : null}
    </span>
  );
}
