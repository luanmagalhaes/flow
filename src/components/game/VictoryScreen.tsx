"use client";

import { Button } from "@/components/ui/Button";
import { Fish } from "@/components/ui/Fish";
import { FishTally } from "@/components/ui/FishTally";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { fish } from "@/utils/plural";
import type { PlayerRow } from "@/types/room";

interface VictoryScreenProps {
  people: PlayerRow[];
  winnerId: string | null;
  myId: string | null;
  onExit: () => void;
}

export function VictoryScreen({ people, winnerId, myId, onExit }: VictoryScreenProps) {
  const ranking = [...people].sort((a, b) => a.fish - b.fish || a.seat - b.seat);
  const fewest = ranking.length > 0 ? ranking[0].fish : 0;
  const front = ranking.filter((person) => person.fish === fewest);
  const tied = front.length > 1;
  const winner = people.find((person) => person.id === winnerId);
  const iWon = tied ? front.some((person) => person.id === myId) : winnerId === myId;
  const headline = tied
    ? iWon
      ? "Você empatou na frente!"
      : `Empate entre ${front.map((person) => person.name).join(" e ")}`
    : iWon
      ? "Você venceu!"
      : `${winner?.name ?? "Alguém"} venceu`;

  return (
    <Screen
      footer={
        <Button variant="koi" size="lg" fullWidth onClick={onExit}>
          Voltar para o início
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <Wordmark size="sm" />

        <div className="animate-stamp-pop">
          <Fish className="w-28" tone="soft" />
        </div>

        <h1 className="display text-4xl leading-tight text-balance text-ink">{headline}</h1>
        <p className="max-w-[28ch] text-sm font-semibold text-ink/65">
          {tied
            ? `Terminaram com ${fish(fewest)} cada. Ninguém saiu na frente.`
            : `Terminou com ${fish(winner?.fish ?? 0)} na mão. Menos peixe, mais fluxo.`}
        </p>
      </div>

      <section className="mt-7">
        <h2 className="display mb-3 text-lg text-ink">Placar final</h2>
        <ul className="flex flex-col gap-2">
          {ranking.map((person, index) => (
            <li
              key={person.id}
              className={`flex items-center gap-3 rounded-2xl border-2 border-ink p-3 ${
                person.fish === fewest ? "bg-cyan" : "bg-paper"
              }`}
            >
              <span className="display flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink text-sm text-paper">
                {index + 1}
              </span>
              <span className="display min-w-0 flex-1 truncate text-ink">
                {person.name}
                {person.id === myId ? " (você)" : ""}
              </span>
              <FishTally count={person.fish} />
            </li>
          ))}
        </ul>
      </section>
    </Screen>
  );
}
