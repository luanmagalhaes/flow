"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { maxAnswerLength } from "@/lib/game/limits";

interface SlateProps {
  prompt: string;
  saved: string | null;
  busy: boolean;
  onSubmit: (body: string) => void;
}

export function Slate({ prompt, saved, busy, onSubmit }: SlateProps) {
  const [draft, setDraft] = useState(saved ?? "");
  const field = useRef<HTMLInputElement>(null);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current && saved) {
      setDraft(saved);
    }
  }, [saved]);

  const trimmed = draft.trim();
  const ready = trimmed.length > 0 && trimmed !== saved?.trim();
  const left = maxAnswerLength - draft.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="edge-card rounded-3xl border-4 border-ink bg-deep p-5 text-paper">
        <span className="display block text-xs uppercase tracking-[0.2em] text-paper/60">
          A pergunta
        </span>
        <p className="display mt-2 text-xl leading-tight text-balance sm:text-2xl">{prompt}</p>
      </div>

      <div className="edge-card rounded-3xl border-4 border-ink bg-paper p-4">
        <div className="mb-2">
          <span className="display text-xs uppercase tracking-[0.18em] text-ink/45">
            Sua lousa
          </span>
        </div>

        <input
          ref={field}
          value={draft}
          onChange={(event) => {
            touched.current = true;
            setDraft(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && ready && !busy) {
              onSubmit(trimmed);
            }
          }}
          placeholder="Escreva aqui"
          maxLength={maxAnswerLength}
          autoComplete="off"
          autoCapitalize="sentences"
          autoCorrect="off"
          spellCheck={false}
          lang="pt-BR"
          inputMode="text"
          className="display w-full rounded-2xl border-2 border-dashed border-ink/25 bg-foam/40 px-4 py-5 text-center text-2xl text-ink outline-none placeholder:text-ink/25 focus:border-solid focus:border-blue focus:ring-4 focus:ring-blue/20 sm:text-3xl"
        />

        <div className="mt-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              touched.current = true;
              setDraft("");
              field.current?.focus();
            }}
            className="display cursor-pointer rounded-xl px-2 py-1 text-xs text-ink/45 transition-colors hover:text-koi"
          >
            apagar
          </button>
          <span className="text-[0.7rem] font-semibold text-ink/35">{left} restantes</span>
        </div>
      </div>

      <Button
        variant="koi"
        size="lg"
        fullWidth
        disabled={busy || !ready}
        onClick={() => onSubmit(trimmed)}
      >
        {busy
          ? "Enviando..."
          : saved && trimmed === saved.trim()
            ? "Resposta na mesa"
            : saved
              ? "Trocar minha resposta"
              : "Colocar na mesa"}
      </Button>

      {saved ? (
        <p className="text-center text-xs font-semibold text-ink/55">
          Já está valendo: <strong className="text-ink">{saved}</strong>. Dá para trocar até a
          revelação.
        </p>
      ) : null}
    </div>
  );
}
