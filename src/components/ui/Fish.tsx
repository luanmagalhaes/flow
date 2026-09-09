interface FishProps {
  className?: string;
  swimming?: boolean;
  tone?: "koi" | "soft" | "deep";
}

const tones = {
  koi: "var(--color-koi)",
  soft: "var(--color-koi-soft)",
  deep: "var(--color-koi-deep)",
} as const;

export function Fish({ className = "", swimming = false, tone = "koi" }: FishProps) {
  return (
    <svg
      viewBox="0 0 120 64"
      className={`${swimming ? "animate-fish-swim" : ""} ${className}`}
      role="img"
      aria-label="Peixe"
    >
      <path
        d="M8 32c10-14 26-22 44-22 16 0 30 7 40 20 2 2 2 2 0 4-10 13-24 20-40 20-18 0-34-8-44-22z"
        fill={tones[tone]}
      />
      <path d="M92 32 118 12c3-2 5 0 4 4l-6 16 6 16c1 4-1 6-4 4L92 32z" fill={tones[tone]} />
      <path d="M52 12c4-8 10-10 14-6 3 3 2 8-3 12z" fill={tones[tone]} opacity="0.85" />
      <path d="M52 52c4 8 10 10 14 6 3-3 2-8-3-12z" fill={tones[tone]} opacity="0.85" />
      <circle cx="26" cy="27" r="5" fill="var(--color-paper)" />
      <circle cx="26" cy="27" r="2.4" fill="var(--color-ink)" />
    </svg>
  );
}
