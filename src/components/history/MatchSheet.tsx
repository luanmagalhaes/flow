"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import type { MatchRow } from "@/types/history";

function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MatchSheet({
  match,
  onClose,
}: {
  match: MatchRow;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const ordered = [...match.players].sort((a, b) => a.score - b.score);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Partida da mesa ${match.room_code}`}
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/70"
      />

      <div className="animate-card-pop relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-sm flex-col overflow-hidden rounded-[1.75rem] border-4 border-ink bg-foam shadow-[0_14px_0_var(--color-ink)]">
        <div className="shrink-0 border-b-2 border-ink/15 bg-koi px-4 py-3 text-center">
          <p className="display text-xs uppercase tracking-[0.18em] text-ink/70">
            mesa {match.room_code} · {match.rounds} rodadas
          </p>
          <h2 className="display text-2xl leading-tight text-ink">
            {match.winner_name ? `Venceu ${match.winner_name}` : "Sem vencedor"}
          </h2>
          <p className="text-xs font-semibold text-ink/70">
            {longDate(match.finished_at)}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
          <ol className="flex flex-col gap-1.5">
            {ordered.map((player, position) => (
              <li
                key={player.name}
                className={`flex items-center gap-2 rounded-2xl border-2 border-ink px-3 py-2 ${
                  player.name === match.winner_name
                    ? "bg-koi text-ink"
                    : "bg-foam text-ink"
                }`}
              >
                <span className="display w-6 text-center text-sm">
                  {position + 1}
                </span>
                <span className="display flex-1 text-base leading-none">
                  {player.name}
                </span>
                <span className="display text-lg leading-none">
                  {player.score} 🐟
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="shrink-0 border-t-2 border-ink/10 p-3">
          <Button variant="ink" fullWidth onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
