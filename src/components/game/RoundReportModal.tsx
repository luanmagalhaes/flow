"use client";

import { Button } from "@/components/ui/Button";
import { Fish } from "@/components/ui/Fish";
import { Modal } from "@/components/ui/Modal";
import { caught, fish } from "@/utils/plural";
import type { PlayerRow, RoundReport } from "@/types/room";

interface RoundReportModalProps {
  report: RoundReport;
  people: PlayerRow[];
  myId: string | null;
  onClose: () => void;
}

export function RoundReportModal({ report, people, myId, onClose }: RoundReportModalProps) {
  const nameFor = (id: string) => people.find((person) => person.id === id)?.name ?? "alguém";
  const hooked = report.hookedPlayerIds.includes(myId ?? "");
  const saved = report.savedPlayerIds.includes(myId ?? "");

  const title = report.everyoneAlone
    ? "Ninguém seguiu o fluxo"
    : hooked
      ? "Você levou peixe"
      : saved
        ? "Você seguiu o fluxo"
        : `Rodada ${report.roundNumber}`;

  const verdict = report.everyoneAlone
    ? "Ninguém escreveu igual a ninguém, então a mesa toda leva 1 peixe de desvantagem."
    : hooked
      ? "Você escreveu diferente da maioria. Peixe na mão é ponto negativo: quanto mais peixe, pior o seu placar."
      : saved
        ? "Você escreveu igual à maioria e não levou peixe. Mão vazia é o que você quer."
        : null;

  return (
    <Modal
      width="md"
      tone={hooked || report.everyoneAlone ? "bg-koi text-paper" : "bg-cyan text-ink"}
      head={
        <div className="flex flex-col items-center gap-2 text-center">
          <Fish className="w-14" tone={hooked ? "koi" : "soft"} />
          <span className="display text-2xl leading-tight text-balance">{title}</span>
          <span className="text-sm opacity-85">{report.promptBody}</span>
        </div>
      }
      footer={
        <Button variant="ink" size="lg" fullWidth onClick={onClose}>
          Continuar
        </Button>
      }
    >
      {verdict ? (
        <p
          className={`mb-3 rounded-2xl border-2 border-ink px-3 py-2.5 text-xs font-semibold leading-snug ${
            hooked || report.everyoneAlone ? "bg-koi-soft text-ink" : "bg-cyan text-ink"
          }`}
        >
          {verdict}
        </p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {report.groups.map((group) => {
          const safe = group.playerIds.length === report.majoritySize && report.majoritySize > 1;

          return (
            <li
              key={group.key}
              className={`rounded-2xl border-2 border-ink p-3 ${safe ? "bg-cyan" : "bg-koi-soft"}`}
            >
              <div className="flex items-start gap-2">
                <span className="display flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-ink text-xs text-paper">
                  {group.playerIds.length}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="display block break-words text-sm leading-tight text-ink">
                    {group.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink/70">
                    {group.playerIds.map(nameFor).join(", ")}
                  </span>
                </div>
                {safe ? null : <Fish className="w-5 shrink-0" tone="koi" />}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 rounded-2xl border-2 border-ink bg-foam px-3 py-2.5 text-center text-xs font-semibold text-ink">
        {report.everyoneAlone
          ? `A mesa toda levou ${fish(1)} de desvantagem.`
          : `Maioria de ${report.majoritySize} · ${caught(report.hookedPlayerIds.length)}`}
        {" · "}
        sobram {fish(report.fishLeft)} no cardume
      </p>
    </Modal>
  );
}
