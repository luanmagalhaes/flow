"use client";

import { Button } from "@/components/ui/Button";
import { Fish } from "@/components/ui/Fish";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { brand } from "@/data/copy";
import type { DeckKind } from "@/data/prompts";
import type { RecentSeat } from "@/lib/session";

interface HomeScreenProps {
  deck: DeckKind;
  onDeck: (deck: DeckKind) => void;
  seats: readonly RecentSeat[];
  onCreate: () => void;
  onJoin: () => void;
  onResume: (seat: RecentSeat) => void;
  onForget: (code: string) => void;
  onRules: () => void;
}

const decks: { key: DeckKind; label: string; hint: string }[] = [
  { key: "GENERAL", label: "Geral", hint: "Para qualquer mesa" },
  { key: "SPICY", label: "Picante", hint: "Com a turma certa" },
  { key: "MIXED", label: "Misto", hint: "Os dois embaralhados" },
];

export function HomeScreen({
  deck,
  onDeck,
  seats,
  onCreate,
  onJoin,
  onResume,
  onForget,
  onRules,
}: HomeScreenProps) {
  return (
    <Screen
      footer={
        <div className="flex flex-col gap-2">
          <Button variant="koi" size="lg" fullWidth onClick={onCreate}>
            Criar uma mesa
          </Button>
          <Button variant="foam" size="lg" fullWidth onClick={onJoin}>
            Entrar com código
          </Button>
          <button
            type="button"
            onClick={onRules}
            className="display cursor-pointer rounded-xl px-3 py-1.5 text-sm text-ink/60 transition-colors hover:text-ink"
          >
            Como se joga?
          </button>
        </div>
      }
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-7 text-center">
        <div className="animate-word-rise">
          <Wordmark size="lg" />
        </div>

        <p className="max-w-[26ch] text-base font-semibold text-ink/70">{brand.tagline}</p>

        <div className="flex items-center justify-center gap-4">
          <Fish className="w-20" swimming tone="koi" />
          <Fish className="w-12 scale-x-[-1]" swimming tone="soft" />
        </div>

        <div className="w-full">
          <span className="display mb-2 block text-xs uppercase tracking-[0.18em] text-ink/50">
            Baralho
          </span>
          <div className="grid gap-2 sm:grid-cols-3">
            {decks.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => onDeck(option.key)}
                aria-pressed={deck === option.key}
                className={`display cursor-pointer rounded-2xl border-2 border-ink px-3 py-3 text-center transition-all duration-150 hover:-translate-y-[2px] ${
                  deck === option.key
                    ? "bg-koi text-paper shadow-[0_5px_0_var(--color-ink)]"
                    : "bg-paper text-ink hover:bg-foam"
                }`}
              >
                <span className="block text-base leading-none">{option.label}</span>
                <span className="mt-1 block text-[0.65rem] font-semibold opacity-70">
                  {option.hint}
                </span>
              </button>
            ))}
          </div>
        </div>

        {seats.length > 0 ? (
          <div className="w-full">
            <span className="display mb-2 block text-xs uppercase tracking-[0.18em] text-ink/50">
              Voltar para uma mesa
            </span>
            <ul className="flex flex-col gap-2">
              {seats.map((seat) => (
                <li
                  key={`${seat.code}-${seat.name}`}
                  className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-paper p-2"
                >
                  <button
                    type="button"
                    onClick={() => onResume(seat)}
                    className="display min-w-0 flex-1 cursor-pointer rounded-xl px-2 py-1.5 text-left text-sm text-ink transition-colors hover:bg-foam"
                  >
                    <span className="block truncate">{seat.name}</span>
                    <span className="block text-[0.7rem] font-semibold text-ink/50">
                      mesa {seat.code}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onForget(seat.code)}
                    className="display shrink-0 cursor-pointer rounded-lg px-2 py-1 text-xs text-ink/40 transition-colors hover:bg-koi hover:text-paper"
                  >
                    esquecer
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Screen>
  );
}
