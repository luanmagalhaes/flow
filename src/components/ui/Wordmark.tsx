type WordmarkSize = "sm" | "md" | "lg";

interface WordmarkProps {
  size?: WordmarkSize;
  className?: string;
}

const sizes: Record<WordmarkSize, string> = {
  sm: "text-2xl",
  md: "text-5xl sm:text-6xl",
  lg: "text-6xl sm:text-8xl",
};

export function Wordmark({ size = "md", className = "" }: WordmarkProps) {
  return (
    <span
      className={`display inline-block leading-none tracking-tight text-koi ${sizes[size]} ${className}`}
      style={{ textShadow: "0 3px 0 var(--color-paper), 0 6px 0 rgba(10,22,51,0.18)" }}
    >
      FLOW
    </span>
  );
}
