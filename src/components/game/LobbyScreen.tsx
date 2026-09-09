"use client";

import { Button } from "@/components/ui/Button";
import { Fish } from "@/components/ui/Fish";
import { RoomCode } from "@/components/game/RoomCode";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { maxPlayers, minPlayers } from "@/lib/game/limits";
import { players as playerLabel } from "@/utils/plural";
import type { PlayerRow, RoomRow } from "@/types/room";

interface LobbyScreenProps {
  room: RoomRow;
  people: PlayerRow[];
  isHost: boolean;
  busy: boolean;
  error: string | null;
  onStart: () => void;
  onLeave: () => void;
}

const deckLabels: Record<RoomRow["deck"], string> = {
  GENERAL: "Geral",
  SPICY: "Picante",
  MIXED: "Misto",
};

export function LobbyScreen({
  room,
  people,
  isHost,
  busy,
  error,
  onStart,
  onLeave,
}: LobbyScreenProps) {
  const enough = people.length >= minPlayers;

  return (
    <Screen
      footer={
        isHost ? (
          <Button
            variant="koi"
            size="lg"
            fullWidth
            disabled={busy || !enough}
            onClick={onStart}
          >
            {busy
              ? "Começando..."
              : enough
                ? "Começar a partida"
                : `Faltam ${minPlayers - people.length} para começar`}
          </Button>
        ) : (
          <p className="display text-center text-sm text-ink/60">
            Esperando quem abriu a mesa começar
          </p>
        )
      }
    >
      <header className="mb-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onLeave}
          className="display cursor-pointer rounded-xl px-2 py-1 text-sm text-ink/55 transition-colors hover:text-ink"
        >
          ← Sair
        </button>
        <Wordmark size="sm" />
      </header>

      <div className="mb-6">
        <RoomCode
          code={room.code}
          hint={`baralho ${deckLabels[room.deck]} · até ${maxPlayers} pessoas`}
        />
      </div>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="display text-lg text-ink">Na mesa</h2>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink/45">
            {playerLabel(people.length)}
          </span>
        </div>

        <ul className="flex flex-col gap-2">
          {people.map((person) => (
            <li
              key={person.id}
              className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-paper p-3"
            >
              <Fish className="w-8 shrink-0" tone={person.is_host ? "koi" : "soft"} />
              <span className="display min-w-0 flex-1 truncate text-ink">{person.name}</span>
              {person.is_host ? (
                <span className="display shrink-0 rounded-full border-2 border-ink bg-cyan px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-ink">
                  host
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {error ? (
        <p className="mt-5 rounded-2xl border-2 border-ink bg-koi px-4 py-3 text-sm font-semibold text-paper">
          {error}
        </p>
      ) : null}
    </Screen>
  );
}
