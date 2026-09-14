"use client";

import { useEffect, useState } from "react";
import { Fish } from "@/components/ui/Fish";
import { Wordmark } from "@/components/ui/Wordmark";

const holdMs = 1850;
const fadeMs = 620;

const school = [
  { top: "14%", size: "w-16", tone: "soft" as const, delay: 0, span: 2600 },
  { top: "28%", size: "w-10", tone: "deep" as const, delay: 320, span: 3100 },
  { top: "66%", size: "w-12", tone: "soft" as const, delay: 180, span: 2900 },
  { top: "80%", size: "w-8", tone: "deep" as const, delay: 620, span: 3300 },
];

interface SplashScreenProps {
  onDone: () => void;
}

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const start = window.setTimeout(() => setLeaving(true), holdMs);

    return () => window.clearTimeout(start);
  }, []);

  useEffect(() => {
    if (!leaving) {
      return;
    }

    const finish = window.setTimeout(onDone, fadeMs);

    return () => window.clearTimeout(finish);
  }, [leaving, onDone]);

  return (
    <div
      className={`stage-water fixed inset-0 z-[95] flex flex-col items-center justify-center gap-8 overflow-hidden px-8 ${
        leaving ? "animate-curtain-out" : ""
      }`}
    >
      {school.map((swimmer, index) => (
        <span
          key={index}
          aria-hidden
          className={`animate-fish-cross absolute ${swimmer.size} opacity-45`}
          style={{
            top: swimmer.top,
            animationDelay: `${swimmer.delay}ms`,
            animationDuration: `${swimmer.span}ms`,
          }}
        >
          <Fish tone={swimmer.tone} className="w-full" />
        </span>
      ))}

      <div className="relative flex items-center justify-center">
        <span className="animate-ripple-out absolute h-32 w-32 rounded-full bg-paper/45" />
        <div className="animate-fish-dive">
          <Fish swimming className="w-36 sm:w-44" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 overflow-hidden">
        <Wordmark size="lg" className="animate-word-rise" />
        <p
          className="animate-word-rise text-xs font-semibold uppercase tracking-[0.28em] text-ink/65"
          style={{ animationDelay: "180ms" }}
        >
          Entrando na correnteza
        </p>
      </div>
    </div>
  );
}
