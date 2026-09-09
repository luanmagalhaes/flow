"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Fish } from "@/components/ui/Fish";
import type { AnswerGroup } from "@/lib/game/grouping";
import type { PlayerRow } from "@/types/room";

interface RevealBoardProps {
  groups: AnswerGroup[];
  people: PlayerRow[];
  isReader: boolean;
  busy: boolean;
  onMerge: (sourceKey: string, targetKey: string) => void;
  onSplit: (playerId: string) => void;
  onConfirm: () => void;
}

export function RevealBoard({
  groups,
  people,
  isReader,
  busy,
  onMerge,
  onSplit,
  onConfirm,
}: RevealBoardProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const majority = groups.length > 0 ? Math.max(...groups.map((g) => g.playerIds.length)) : 0;
  const nameFor = (id: string) => people.find((person) => person.id === id)?.name ?? "alguém";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="display text-lg text-ink">O que a mesa escreveu</h2>
        {isReader ? (
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-ink/45">
            toque em dois para juntar
          </span>
        ) : null}
      </div>

      <ul className="flex flex-col gap-2">
        {groups.map((group) => {
          const safe = group.playerIds.length === majority && majority > 1;
          const active = picked === group.key;

          return (
            <li key={group.key}>
              <div
                className={`rounded-2xl border-2 border-ink p-3 transition-all duration-150 ${
                  safe ? "bg-cyan" : "bg-koi-soft"
                } ${active ? "ring-4 ring-ink/30" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {isReader ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (picked && picked !== group.key) {
                          onMerge(picked, group.key);
                          setPicked(null);

                          return;
                        }

                        setPicked(active ? null : group.key);
                      }}
                      className="display shrink-0 cursor-pointer rounded-xl border-2 border-ink bg-paper px-2 py-1 text-xs text-ink transition-colors hover:bg-foam"
                    >
                      {active ? "juntar com..." : "juntar"}
                    </button>
                  ) : (
                    <span className="display flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-ink text-xs text-paper">
                      {group.playerIds.length}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <span className="display block break-words text-base leading-tight text-ink">
                      {group.label}
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {group.playerIds.map((id) => (
                        <span
                          key={id}
                          className="flex items-center gap-1 rounded-full border-2 border-ink bg-paper px-2 py-0.5 text-[0.7rem] font-semibold text-ink"
                        >
                          {nameFor(id)}
                          {isReader && group.playerIds.length > 1 ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => onSplit(id)}
                              aria-label={`Separar ${nameFor(id)} deste grupo`}
                              className="cursor-pointer text-ink/40 transition-colors hover:text-koi"
                            >
                              ×
                            </button>
                          ) : null}
                        </span>
                      ))}
                    </div>
                  </div>

                  {safe ? (
                    <span className="display shrink-0 rounded-full border-2 border-ink bg-paper px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-ink">
                      salvo
                    </span>
                  ) : (
                    <Fish className="w-6 shrink-0" tone="koi" />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {majority <= 1 ? (
        <p className="rounded-2xl border-2 border-ink bg-koi px-4 py-3 text-sm font-semibold text-paper">
          Ninguém concordou com ninguém. Do jeito que está, a mesa toda pega peixe.
        </p>
      ) : null}

      {isReader ? (
        <Button variant="ink" size="lg" fullWidth disabled={busy} onClick={onConfirm}>
          {busy ? "Fechando..." : "Fechar a rodada e dar os peixes"}
        </Button>
      ) : (
        <p className="display text-center text-sm text-ink/60">
          Quem leu a carta está conferindo os grupos
        </p>
      )}
    </div>
  );
}
