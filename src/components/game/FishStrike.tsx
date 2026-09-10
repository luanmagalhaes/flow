"use client";

import { useEffect } from "react";
import { Fish } from "@/components/ui/Fish";

interface FishStrikeProps {
  onDone: () => void;
}

export function FishStrike({ onDone }: FishStrikeProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1500);

    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center">
      <div className="animate-fish-strike">
        <div className="animate-fish-shudder">
          <div className="relative">
            <Fish className="w-48 drop-shadow-[0_10px_0_var(--color-ink)] sm:w-64" tone="koi" />
            <span className="display absolute -right-2 -top-4 rotate-12 rounded-2xl border-4 border-ink bg-ink px-3 py-1 text-2xl text-koi">
              −1
            </span>
          </div>
        </div>
      </div>

      <span className="display absolute bottom-[18vh] left-1/2 -translate-x-1/2 rounded-2xl border-4 border-ink bg-koi px-4 py-2 text-center text-lg text-paper shadow-[0_8px_0_var(--color-ink)]">
        Peixe na sua mão · ponto negativo
      </span>
    </div>
  );
}
