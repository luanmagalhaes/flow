"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { faces } from "@/data/faces";
import { api } from "@/lib/api";
import { shrinkToBlob } from "@/lib/photo";
import type { PlayerRow } from "@/types/room";

export function AvatarPicker({
  code,
  token,
  me,
  onDone,
}: {
  code: string;
  token: string;
  me: PlayerRow;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const run = async (action: () => Promise<unknown>) => {
    if (busy) {
      return;
    }

    setBusy(true);
    setProblem(null);

    try {
      await action();
      onDone();
    } catch (cause) {
      setProblem(cause instanceof Error ? cause.message : "Não consegui trocar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-ink bg-paper p-3">
      <div className="flex items-center gap-3">
        <Avatar name={me.name} photo={me.avatar} emoji={me.emoji} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="display text-ink">Sua cara</p>
          <p className="text-xs font-semibold text-ink/60">
            Escolha um bichinho ou mande uma foto sua.
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-8 gap-1">
        {faces.map((face) => (
          <button
            key={face}
            type="button"
            disabled={busy}
            aria-label={`Usar ${face}`}
            aria-pressed={me.emoji === face}
            onClick={() => void run(() => api.setEmoji(code, token, face))}
            className={`cursor-pointer rounded-lg border-2 py-1 text-xl disabled:opacity-50 ${
              me.emoji === face ? "border-ink bg-cyan" : "border-transparent bg-cream"
            }`}
          >
            {face}
          </button>
        ))}
      </div>

      <input
        ref={file}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const picked = event.target.files?.[0];

          event.target.value = "";

          if (!picked) {
            return;
          }

          void run(async () => {
            const small = await shrinkToBlob(picked);

            await api.setPhoto(code, token, small);
          });
        }}
      />

      <button
        type="button"
        disabled={busy}
        onClick={() => file.current?.click()}
        className="display mt-2 w-full cursor-pointer rounded-xl border-2 border-ink bg-cyan py-2 text-xs text-ink disabled:opacity-50"
      >
        {busy ? "Um instante" : "Usar minha foto"}
      </button>

      {problem ? (
        <p className="mt-2 rounded-lg bg-koi px-2 py-1 text-center text-[0.7rem] font-semibold text-paper">
          {problem}
        </p>
      ) : null}
    </div>
  );
}
