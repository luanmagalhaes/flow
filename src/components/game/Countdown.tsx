"use client";

interface CountdownProps {
  secondsLeft: number;
  total: number;
  label: string;
}

const radius = 44;
const circumference = 2 * Math.PI * radius;

export function Countdown({ secondsLeft, total, label }: CountdownProps) {
  const ratio = total > 0 ? Math.min(1, Math.max(0, secondsLeft / total)) : 0;
  const urgent = secondsLeft <= 10;
  const warm = secondsLeft <= 20 && !urgent;

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <svg viewBox="0 0 100 100" className="w-20 -rotate-90 sm:w-24" aria-hidden="true">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-ink)" strokeWidth="9" opacity="0.12" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={urgent ? "var(--color-koi)" : warm ? "var(--color-koi-soft)" : "var(--color-deep)"}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - ratio)}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 300ms linear" }}
          />
        </svg>
        <span
          className={`display absolute inset-0 flex items-center justify-center text-2xl tabular-nums sm:text-3xl ${
            urgent ? "animate-stamp-pop text-koi" : "text-ink"
          }`}
          key={secondsLeft}
        >
          {secondsLeft}
        </span>
      </div>

      <div className="min-w-0">
        <span className="display block text-base leading-tight text-ink sm:text-lg">{label}</span>
        <span className="mt-0.5 block text-xs font-semibold text-ink/55">
          {urgent
            ? "Acabando! Coloque na mesa."
            : secondsLeft === 0
              ? "Tempo esgotado"
              : "Todos escrevem ao mesmo tempo"}
        </span>
      </div>
    </div>
  );
}
