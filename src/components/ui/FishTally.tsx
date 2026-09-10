import { Fish } from "@/components/ui/Fish";
import { fish } from "@/utils/plural";

interface FishTallyProps {
  count: number;
  max?: number;
  className?: string;
}

export function FishTally({ count, max = 6, className = "" }: FishTallyProps) {
  const shown = Math.min(count, max);
  const rest = count - shown;

  if (count === 0) {
    return (
      <span
        className={`flex shrink-0 items-center gap-1.5 ${className}`}
        title="Nenhum peixe, nenhum ponto negativo"
      >
        <span className="display rounded-lg border-2 border-ink bg-cyan px-1.5 py-0.5 text-xs tabular-nums text-ink">
          0
        </span>
        <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-ink/45">
          sem peixe
        </span>
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center gap-1.5 ${className}`}
      title={`${fish(count)} de desvantagem`}
    >
      <span className="flex items-center gap-0.5">
        {Array.from({ length: shown }, (_, index) => (
          <Fish key={index} className="w-4 shrink-0" tone="koi" />
        ))}
      </span>
      <span className="display rounded-lg border-2 border-ink bg-koi px-1.5 py-0.5 text-xs tabular-nums text-paper">
        −{count}
      </span>
      {rest > 0 ? <span className="display text-[0.65rem] text-ink/60">+{rest}</span> : null}
    </span>
  );
}
