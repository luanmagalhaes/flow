"use client";

import { useEffect, useRef, useState } from "react";
import { nudge } from "@/lib/notify";
import { sound } from "@/lib/sound";
import { RoomPhase, RoundPhase, type RoundReport } from "@/types/room";

interface Watched {
  phase: string;
  roundPhase: string;
  readerId: string | null;
  report: RoundReport | null;
  myId: string | null;
}

export function useTableFeedback(watched: Watched) {
  const [dismissed, setDismissed] = useState<string | null>(null);
  const seen = useRef<Watched | null>(null);

  useEffect(() => {
    const before = seen.current;

    seen.current = watched;

    if (!before) {
      return;
    }

    if (before.roundPhase !== watched.roundPhase) {
      if (watched.roundPhase === RoundPhase.Writing) {
        sound.card();
      }

      if (watched.roundPhase === RoundPhase.Reveal) {
        sound.reveal();
      }
    }

    const mine = watched.myId;

    if (
      mine &&
      watched.readerId === mine &&
      before.readerId !== mine &&
      watched.roundPhase === RoundPhase.Idle
    ) {
      sound.turn();
      nudge("É a sua vez no FLOW", "Puxe a carta e leia para a mesa.");
    }

    const report = watched.report;

    if (report && report.id !== before.report?.id && mine) {
      if (report.hookedPlayerIds.includes(mine)) {
        sound.caught();
      } else if (report.savedPlayerIds.includes(mine)) {
        sound.safe();
      }
    }

    if (before.phase !== RoomPhase.Finished && watched.phase === RoomPhase.Finished) {
      sound.win();
    }
  }, [watched]);

  const report = watched.report;
  const strike =
    report && watched.myId && report.id !== dismissed && report.hookedPlayerIds.includes(watched.myId)
      ? report.id
      : null;

  return { strike, clearStrike: () => setDismissed(report?.id ?? null) };
}
