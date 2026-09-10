"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FishStrike } from "@/components/game/FishStrike";
import { HomeScreen } from "@/components/game/HomeScreen";
import { HowToPlay } from "@/components/game/HowToPlay";
import { JoinScreen } from "@/components/game/JoinScreen";
import { LobbyScreen } from "@/components/game/LobbyScreen";
import { NoticeModal } from "@/components/game/NoticeModal";
import { RoundReportModal } from "@/components/game/RoundReportModal";
import { TableScreen } from "@/components/game/TableScreen";
import { VictoryScreen } from "@/components/game/VictoryScreen";
import { useNow } from "@/hooks/useNow";
import { useRoom } from "@/hooks/useRoom";
import { useSession } from "@/hooks/useSession";
import { useTableFeedback } from "@/hooks/useTableFeedback";
import { api } from "@/lib/api";
import { askToNotify } from "@/lib/notify";
import { applyMuted, sound, unlockSound } from "@/lib/sound";
import {
  prefsSnapshot,
  rememberMuted,
  rememberTutorialSeen,
  serverPrefsSnapshot,
  subscribePrefs,
} from "@/lib/prefs";
import { groupAnswers, type AnswerGroup } from "@/lib/game/grouping";
import { secondsLeft } from "@/lib/game/rotation";
import { decideSeconds, drawSeconds, scoringGrace } from "@/lib/game/limits";
import { promptById, type DeckKind } from "@/data/prompts";
import { RoomPhase, RoundPhase, type RoomRow } from "@/types/room";
import type { RecentSeat } from "@/lib/session";

type View = "HOME" | "CREATE" | "JOIN";

export function GameApp() {
  const { session, seats, save, clear, forget, seatFor } = useSession();
  const [view, setView] = useState<View>("HOME");
  const [deck, setDeck] = useState<DeckKind>("GENERAL");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seenNoticeId, setSeenNoticeId] = useState<string | null>(null);
  const [seenReportId, setSeenReportId] = useState<string | null>(null);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [askedRules, setAskedRules] = useState(false);
  const prefs = useSyncExternalStore(subscribePrefs, prefsSnapshot, serverPrefsSnapshot);
  const showRules = askedRules || !prefs.tutorialSeen;
  const quiet = prefs.muted;

  const { state, refresh } = useRoom(session?.code ?? null, session?.accessToken ?? null);
  const now = useNow(1000);
  const clockRef = useRef<RoomRow | null>(null);

  useEffect(() => {
    clockRef.current = state?.room ?? null;
  }, [state?.room]);

  useEffect(() => {
    applyMuted(prefs.muted);
  }, [prefs.muted]);

  useEffect(() => {
    const prime = () => unlockSound();

    window.addEventListener("pointerdown", prime, { once: true });

    return () => window.removeEventListener("pointerdown", prime);
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timer = window.setTimeout(() => setError(null), 4000);

    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    const code = session?.code;

    if (!code) {
      return;
    }

    const check = async () => {
      const room = clockRef.current;

      if (!room || room.phase !== RoomPhase.Playing) {
        return;
      }

      const limits: Record<string, number> = {
        [RoundPhase.Idle]: drawSeconds,
        [RoundPhase.Writing]: room.write_seconds,
        [RoundPhase.Reveal]: decideSeconds,
        [RoundPhase.Scoring]: scoringGrace,
      };

      const limit = limits[room.round_phase];

      if (limit === undefined || secondsLeft(room.round_started_at, limit, Date.now()) > 0) {
        return;
      }

      try {
        await api.timeout(code);
        await refresh();
      } catch {
        return;
      }
    };

    const timer = window.setInterval(() => void check(), 3000);

    return () => window.clearInterval(timer);
  }, [session?.code, refresh]);

  const run = useCallback(async (work: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);

    try {
      await work();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "algo deu errado");
    } finally {
      setBusy(false);
    }
  }, []);

  const rulesGate = showRules ? (
    <HowToPlay
      onClose={() => {
        setAskedRules(false);
        rememberTutorialSeen();
      }}
    />
  ) : null;

  const watched = useMemo(
    () => ({
      phase: state?.room.phase ?? "",
      roundPhase: state?.room.round_phase ?? "",
      readerId: state?.room.reader_player_id ?? null,
      report: state?.room.last_round ?? null,
      myId: state?.meId ?? null,
    }),
    [
      state?.room.phase,
      state?.room.round_phase,
      state?.room.reader_player_id,
      state?.room.last_round,
      state?.meId,
    ],
  );
  const feedback = useTableFeedback(watched);

  const leave = useCallback(() => {
    clear();
    setView("HOME");
  }, [clear]);

  if (!session) {
    if (view === "CREATE" || view === "JOIN") {
      return (
        <JoinScreen
          mode={view}
          busy={busy}
          error={error}
          onBack={() => {
            setError(null);
            setView("HOME");
          }}
          onSubmit={(input) =>
            run(async () => {
              const known = view === "JOIN" ? seatFor(input.code, input.name) : null;

              if (known) {
                save({
                  code: known.code,
                  name: known.name,
                  playerId: known.playerId,
                  accessToken: known.accessToken,
                });
                setView("HOME");

                return;
              }

              const result =
                view === "CREATE"
                  ? await api.createRoom(input.name, deck)
                  : await api.joinRoom(input.code, input.name);

              save(result);
              setView("HOME");
            })
          }
        />
      );
    }

    return (
      <>
        {rulesGate}
        <HomeScreen
        deck={deck}
        onDeck={setDeck}
        seats={seats}
        onCreate={() => setView("CREATE")}
        onJoin={() => setView("JOIN")}
        onResume={(seat: RecentSeat) =>
          save({
            code: seat.code,
            name: seat.name,
            playerId: seat.playerId,
            accessToken: seat.accessToken,
          })
        }
          onForget={forget}
          onRules={() => setAskedRules(true)}
        />
      </>
    );
  }

  if (!state) {
    return (
      <div className="stage-water flex min-h-dvh items-center justify-center px-8">
        <p className="display text-lg text-ink/70">Nadando até a mesa...</p>
      </div>
    );
  }

  const me = state.players.find((person) => person.id === state.meId);
  const notice = state.room.last_notice;
  const visibleNotice = notice && notice.id !== seenNoticeId ? notice : null;
  const report = state.room.last_round;
  const visibleReport =
    report && report.id !== seenReportId && state.room.round_phase === RoundPhase.Idle
      ? report
      : null;

  if (state.room.phase === RoomPhase.Finished) {
    return (
      <>
        {rulesGate}

        {visibleReport ? (
          <RoundReportModal
            report={visibleReport}
            people={state.players}
            myId={state.meId}
            onClose={() => setSeenReportId(visibleReport.id)}
          />
        ) : null}

        <VictoryScreen
          people={state.players}
          winnerId={state.room.winner_player_id}
          myId={state.meId}
          onExit={leave}
        />
      </>
    );
  }

  if (state.room.phase === RoomPhase.Lobby) {
    return (
      <>
        {rulesGate}

        {visibleNotice ? (
          <NoticeModal notice={visibleNotice} onClose={() => setSeenNoticeId(visibleNotice.id)} />
        ) : null}

        <LobbyScreen
          room={state.room}
          people={state.players}
          isHost={me?.is_host ?? false}
          busy={busy}
          error={error}
          onStart={() =>
            run(async () => {
              void askToNotify();
              unlockSound();
              await api.start(session.code, session.accessToken);
            })
          }
          onRules={() => setAskedRules(true)}
          onLeave={() => setConfirmingLeave(true)}
        />

        {confirmingLeave ? (
          <ConfirmModal
            title="Sair da mesa?"
            tone="danger"
            confirmLabel="Sair"
            cancelLabel="Ficar"
            body={<p>Você sai da mesa e precisa do código para voltar.</p>}
            onCancel={() => setConfirmingLeave(false)}
            onConfirm={() =>
              run(async () => {
                await api.leave(session.code, session.accessToken);
                setConfirmingLeave(false);
                leave();
              })
            }
          />
        ) : null}
      </>
    );
  }

  const prompt = state.room.current_prompt_id ? promptById(state.room.current_prompt_id) : undefined;
  const groups: AnswerGroup[] =
    state.answers.length > 0
      ? state.answers.reduce<AnswerGroup[]>((acc, answer) => {
          const host = acc.find((group) => group.key === answer.groupKey);

          if (host) {
            host.playerIds.push(answer.playerId);

            return acc;
          }

          acc.push({ key: answer.groupKey, label: answer.body, playerIds: [answer.playerId] });

          return acc;
        }, [])
      : groupAnswers([]);

  return (
    <>
      {rulesGate}

      {feedback.strike ? <FishStrike onDone={feedback.clearStrike} /> : null}

      {visibleNotice ? (
        <NoticeModal notice={visibleNotice} onClose={() => setSeenNoticeId(visibleNotice.id)} />
      ) : feedback.strike ? null : visibleReport ? (
        <RoundReportModal
          report={visibleReport}
          people={state.players}
          myId={state.meId}
          onClose={() => setSeenReportId(visibleReport.id)}
        />
      ) : null}

      <TableScreen
        room={state.room}
        people={state.players}
        events={state.events}
        myId={state.meId}
        promptBody={prompt?.body ?? ""}
        myAnswer={state.myAnswer}
        submittedIds={state.submittedIds}
        groups={groups.sort(
          (a, b) => b.playerIds.length - a.playerIds.length || a.key.localeCompare(b.key),
        )}
        secondsLeft={secondsLeft(state.room.round_started_at, state.room.write_seconds, now)}
        isHost={me?.is_host ?? false}
        busy={busy}
        error={error}
        quiet={quiet}
        onQuiet={(next) => {
          rememberMuted(next);
          applyMuted(next);

          if (!next) {
            sound.bubble();
          }
        }}
        onRules={() => setAskedRules(true)}
        onDraw={() =>
          run(async () => {
            sound.tap();
            await api.draw(session.code, session.accessToken);
            await refresh();
          })
        }
        onAnswer={(body) =>
          run(async () => {
            await api.answer(session.code, session.accessToken, body);
            sound.wrote();
            await refresh();
          })
        }
        onReveal={() =>
          run(async () => {
            await api.reveal(session.code, session.accessToken);
            await refresh();
          })
        }
        onMerge={(sourceKey, targetKey) =>
          run(async () => {
            await api.merge(session.code, session.accessToken, sourceKey, targetKey);
            await refresh();
          })
        }
        onSplit={(playerId) =>
          run(async () => {
            await api.split(session.code, session.accessToken, playerId);
            await refresh();
          })
        }
        onConfirm={() =>
          run(async () => {
            await api.confirm(session.code, session.accessToken);
            await refresh();
          })
        }
        onRemovePlayer={(playerId) =>
          run(async () => {
            await api.removePlayer(session.code, session.accessToken, playerId);
            await refresh();
          })
        }
        onLeave={() => setConfirmingLeave(true)}
      />

      {confirmingLeave ? (
        <ConfirmModal
          title="Sair da partida?"
          tone="danger"
          confirmLabel="Sair da partida"
          cancelLabel="Continuar jogando"
          busy={busy}
          body={
            <>
              <p>Você sai da mesa agora e a partida segue sem você.</p>
              <p className="mt-2 rounded-xl bg-foam px-3 py-2 text-xs">
                Seus peixes saem do placar junto.
              </p>
            </>
          }
          onCancel={() => setConfirmingLeave(false)}
          onConfirm={() =>
            run(async () => {
              await api.leave(session.code, session.accessToken);
              setConfirmingLeave(false);
              leave();
            })
          }
        />
      ) : null}
    </>
  );
}
