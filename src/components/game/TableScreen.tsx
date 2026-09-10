"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Fish } from "@/components/ui/Fish";
import { FishTally } from "@/components/ui/FishTally";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { RevealBoard } from "@/components/game/RevealBoard";
import { Countdown } from "@/components/game/Countdown";
import { Slate } from "@/components/game/Slate";
import type { AnswerGroup } from "@/lib/game/grouping";
import { fish } from "@/utils/plural";
import { RoundPhase, type EventRow, type PlayerRow, type RoomRow } from "@/types/room";

interface TableScreenProps {
  room: RoomRow;
  people: PlayerRow[];
  events: EventRow[];
  myId: string | null;
  promptBody: string;
  myAnswer: string | null;
  submittedIds: string[];
  groups: AnswerGroup[];
  secondsLeft: number;
  isHost: boolean;
  quiet: boolean;
  busy: boolean;
  error: string | null;
  onDraw: () => void;
  onAnswer: (body: string) => void;
  onReveal: () => void;
  onMerge: (sourceKey: string, targetKey: string) => void;
  onSplit: (playerId: string) => void;
  onConfirm: () => void;
  onRemovePlayer: (playerId: string) => void;
  onQuiet: (next: boolean) => void;
  onRules: () => void;
  onLeave: () => void;
}

const eventLabels: Record<string, string> = {
  PLAYER_JOINED: "entrou na mesa",
  MATCH_STARTED: "começou a partida",
  READER_PICKED: "vai ler a primeira carta",
  PROMPT_DRAWN: "leu a carta",
  ROUND_REVEALED: "revelou a mesa",
  ROUND_SCORED: "fechou a rodada",
  ROUND_SPLIT: "fechou a rodada sem maioria",
  GROUPS_MERGED: "juntou dois grupos",
  GROUP_SPLIT: "separou uma resposta",
  PLAYER_REMOVED: "tirou alguém da mesa",
  PLAYER_LEFT: "saiu da mesa",
  READER_TIMEOUT: "lerdou e dormiu na praia",
  MATCH_WON: "venceu a partida",
};

function labelFor(type: string): string {
  return eventLabels[type] ?? "mexeu na mesa";
}

export function TableScreen({
  room,
  people,
  events,
  myId,
  promptBody,
  myAnswer,
  submittedIds,
  groups,
  secondsLeft,
  isHost,
  quiet,
  busy,
  error,
  onDraw,
  onAnswer,
  onReveal,
  onMerge,
  onSplit,
  onConfirm,
  onRemovePlayer,
  onQuiet,
  onRules,
  onLeave,
}: TableScreenProps) {
  const [confirmingRemoval, setConfirmingRemoval] = useState<string | null>(null);
  const reader = people.find((person) => person.id === room.reader_player_id);
  const isReader = Boolean(myId && room.reader_player_id === myId);
  const ranking = [...people].sort((a, b) => a.fish - b.fish || a.seat - b.seat);
  const waiting = people.filter((person) => !submittedIds.includes(person.id));
  const pendingRemoval = people.find((person) => person.id === confirmingRemoval);

  return (
    <Screen wide>
      {pendingRemoval ? (
        <ConfirmModal
          title={`Tirar ${pendingRemoval.name} da mesa?`}
          tone="danger"
          busy={busy}
          confirmLabel="Tirar da mesa"
          cancelLabel="Deixa quieto"
          body={
            <>
              <p>
                <strong className="text-ink">{pendingRemoval.name}</strong> sai da partida na hora e
                não consegue voltar para esta mesa.
              </p>
              <p className="mt-2 rounded-xl bg-foam px-3 py-2 text-xs">
                Os {fish(pendingRemoval.fish)} dela saem do placar junto.
              </p>
            </>
          }
          onCancel={() => setConfirmingRemoval(null)}
          onConfirm={() => {
            onRemovePlayer(pendingRemoval.id);
            setConfirmingRemoval(null);
          }}
        />
      ) : null}

      <header className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onLeave}
          className="display cursor-pointer rounded-xl px-2 py-1 text-sm text-ink/55 transition-colors hover:text-ink"
        >
          ← Sair
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(room.code).catch(() => undefined)}
            aria-label={`Copiar o código ${room.code}`}
            title="Copiar o código da mesa"
            className="display cursor-pointer select-all rounded-full border-2 border-ink bg-paper px-3 py-1 text-xs text-ink transition-colors hover:bg-foam"
          >
            {room.code}
          </button>
          <span className="display flex items-center gap-1.5 rounded-full border-2 border-ink bg-deep px-3 py-1 text-xs text-paper">
            <Fish className="w-4" tone="soft" />
            {room.fish_left} no cardume
          </span>
          <button
            type="button"
            onClick={() => onQuiet(!quiet)}
            aria-label={quiet ? "Ligar os sons" : "Desligar os sons"}
            title={quiet ? "Ligar os sons" : "Desligar os sons"}
            className="display cursor-pointer rounded-full border-2 border-ink bg-paper px-2.5 py-1 text-xs text-ink transition-colors hover:bg-foam"
          >
            {quiet ? "som off" : "som on"}
          </button>
          <button
            type="button"
            onClick={onRules}
            className="display cursor-pointer rounded-full border-2 border-ink bg-paper px-2.5 py-1 text-xs text-ink transition-colors hover:bg-foam"
          >
            regras
          </button>
          <Wordmark size="sm" className="hidden opacity-60 sm:inline-block" />
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-5">
          {room.round_phase === RoundPhase.Idle ? (
            <div className="edge-card rounded-3xl border-4 border-ink bg-paper p-5 text-center">
              <span className="display block text-xs uppercase tracking-[0.2em] text-ink/50">
                Rodada {room.round_number + 1}
              </span>
              <p className="display mt-2 text-xl leading-tight text-ink">
                {isReader ? "Você lê a próxima carta" : `${reader?.name ?? "Alguém"} lê a carta`}
              </p>
              {isReader ? (
                <div className="mt-4">
                  <Button variant="koi" size="lg" fullWidth disabled={busy} onClick={onDraw}>
                    {busy ? "Puxando..." : "Puxar a carta"}
                  </Button>
                </div>
              ) : (
                <p className="mt-2 text-sm text-ink/60">Já vai começar, prepare a lousa.</p>
              )}
            </div>
          ) : null}

          {room.round_phase === RoundPhase.Writing ? (
            <>
              <div className="edge-card rounded-3xl border-4 border-ink bg-paper p-4">
                <Countdown
                  secondsLeft={secondsLeft}
                  total={room.write_seconds}
                  label={`Rodada ${room.round_number} · lousa aberta`}
                />
              </div>

              <Slate
                key={`${room.round_number}-${room.current_prompt_id ?? "none"}`}
                prompt={promptBody}
                saved={myAnswer}
                busy={busy}
                onSubmit={onAnswer}
              />

              <div className="rounded-3xl border-2 border-ink bg-paper p-4">
                <span className="display block text-xs uppercase tracking-[0.18em] text-ink/50">
                  Já colocaram na mesa · {submittedIds.length} de {people.length}
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {people.map((person) => {
                    const done = submittedIds.includes(person.id);

                    return (
                      <span
                        key={person.id}
                        className={`rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-semibold ${
                          done ? "bg-cyan text-ink" : "bg-paper text-ink/40"
                        }`}
                      >
                        {person.name}
                      </span>
                    );
                  })}
                </div>

                {isReader ? (
                  <div className="mt-3">
                    <Button
                      variant="ink"
                      fullWidth
                      disabled={busy || submittedIds.length === 0}
                      onClick={onReveal}
                    >
                      {waiting.length === 0
                        ? "Revelar a mesa"
                        : `Revelar mesmo sem ${waiting.length}`}
                    </Button>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          {room.round_phase === RoundPhase.Scoring ? (
            <div className="edge-card rounded-3xl border-4 border-ink bg-paper p-5 text-center">
              <p className="display text-lg text-ink">Fechando a rodada...</p>
              <p className="mt-1 text-sm text-ink/60">Distribuindo os peixes do cardume.</p>
            </div>
          ) : null}

          {room.round_phase === RoundPhase.Reveal ? (
            <div className="edge-card rounded-3xl border-4 border-ink bg-paper p-5">
              <p className="display mb-4 text-lg leading-tight text-ink">{promptBody}</p>
              <RevealBoard
                groups={groups}
                people={people}
                isReader={isReader}
                busy={busy}
                onMerge={onMerge}
                onSplit={onSplit}
                onConfirm={onConfirm}
              />
            </div>
          ) : null}

          {error ? (
            <p className="rounded-2xl border-2 border-ink bg-koi px-4 py-3 text-sm font-semibold text-paper">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="display text-lg text-ink">Placar</h2>
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-ink/45">
                {isHost ? "toque em alguém para tirar" : "peixe = ponto negativo"}
              </span>
            </div>

            <ul className="flex flex-col gap-2">
              {ranking.map((person, index) => (
                <li key={person.id}>
                  {(() => {
                    const removable = isHost && person.id !== myId;
                    const skin = `flex w-full items-center gap-2.5 rounded-2xl border-2 border-ink p-2.5 text-left ${
                      person.id === room.reader_player_id ? "bg-cyan" : "bg-paper"
                    }`;
                    const inside = (
                      <>
                        <span className="display flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-ink text-xs text-paper">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="display block truncate text-sm text-ink">
                            {person.name}
                            {person.id === myId ? " (você)" : ""}
                          </span>
                          {person.id === room.reader_player_id ? (
                            <span className="block text-[0.65rem] font-semibold uppercase tracking-wider text-ink/55">
                              lendo a carta
                            </span>
                          ) : null}
                        </span>
                        <FishTally count={person.fish} max={6} className="shrink-0" />
                      </>
                    );

                    if (!removable) {
                      return <div className={skin}>{inside}</div>;
                    }

                    return (
                      <button
                        type="button"
                        onClick={() => setConfirmingRemoval(person.id)}
                        disabled={busy}
                        aria-label={`Abrir opções de ${person.name}`}
                        title={`Toque para tirar ${person.name} da mesa`}
                        className={`${skin} cursor-pointer transition-colors hover:border-koi hover:bg-koi-soft disabled:cursor-not-allowed`}
                      >
                        {inside}
                      </button>
                    );
                  })()}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="display mb-2 text-base text-ink">Rolou agora</h2>
            <ul className="flex flex-col gap-1.5">
              {events.slice(0, 8).map((event) => {
                const actor = people.find((person) => person.id === event.actor_id);

                return (
                  <li
                    key={event.id}
                    className="rounded-xl border-2 border-ink/15 bg-paper/70 px-3 py-2 text-xs text-ink"
                  >
                    <span className="display">{actor?.name ?? "alguém"}</span>{" "}
                    <span>{labelFor(event.type)}</span>
                    {event.detail ? (
                      <span className="mt-0.5 block leading-snug text-ink/60">{event.detail}</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </Screen>
  );
}
