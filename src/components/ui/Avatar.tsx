import { initialsFor } from "@/lib/photo";

type Size = "sm" | "md" | "lg";

const boxes: Record<Size, string> = {
  sm: "h-8 w-8 text-[0.6rem]",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-xl",
};

const glyphs: Record<Size, string> = {
  sm: "text-base",
  md: "text-2xl",
  lg: "text-4xl",
};

export function Avatar({
  name,
  photo,
  emoji = null,
  size = "md",
  className = "",
}: {
  name: string;
  photo: string | null;
  emoji?: string | null;
  size?: Size;
  className?: string;
}) {
  return (
    <span
      className={`border-ink bg-cyan relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 ${boxes[size]} ${className}`}
    >
      {photo ? (
        <img src={photo} alt={name} className="h-full w-full object-cover" />
      ) : emoji ? (
        <span className={`leading-none ${glyphs[size]}`}>{emoji}</span>
      ) : (
        <span className="display text-ink">{initialsFor(name)}</span>
      )}
    </span>
  );
}
