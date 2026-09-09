"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { maxPlayers, minPlayers } from "@/lib/game/limits";

interface JoinScreenProps {
  mode: "CREATE" | "JOIN";
  busy: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: (input: { name: string; code: string }) => void;
}

export function JoinScreen({ mode, busy, error, onBack, onSubmit }: JoinScreenProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const creating = mode === "CREATE";
  const ready = name.trim().length > 0 && (creating || code.trim().length === 6);

  return (
    <Screen
      footer={
        <Button
          variant="koi"
          size="lg"
          fullWidth
          disabled={busy || !ready}
          onClick={() => onSubmit({ name: name.trim(), code: code.trim().toUpperCase() })}
        >
          {busy ? "Um instante..." : creating ? "Abrir a mesa" : "Entrar na mesa"}
        </Button>
      }
    >
      <header className="mb-7">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="display cursor-pointer rounded-xl px-2 py-1 text-sm text-ink/55 transition-colors hover:text-ink"
          >
            ← Voltar
          </button>
          <Wordmark size="sm" />
        </div>
        <h1 className="display text-3xl text-ink">
          {creating ? "Nova mesa" : "Entrar na mesa"}
        </h1>
        <p className="mt-1 text-sm text-ink/65">
          {creating
            ? `De ${minPlayers} a ${maxPlayers} pessoas, cada uma no próprio celular.`
            : "Peça o código de 6 letras para quem abriu a mesa."}
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="display text-xs uppercase tracking-[0.18em] text-ink/50">Seu nome</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Como aparece na mesa"
            maxLength={24}
            autoComplete="off"
            autoCapitalize="words"
            autoCorrect="off"
            spellCheck={false}
            lang="pt-BR"
            inputMode="text"
            className="w-full rounded-2xl border-2 border-ink bg-paper px-4 py-3 text-base text-ink outline-none placeholder:text-ink/30 focus:ring-4 focus:ring-blue/25"
          />
        </label>

        {creating ? null : (
          <label className="flex flex-col gap-1.5">
            <span className="display text-xs uppercase tracking-[0.18em] text-ink/50">
              Código da mesa
            </span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="display w-full rounded-2xl border-2 border-ink bg-paper px-4 py-3 text-center text-2xl tracking-[0.3em] text-ink outline-none placeholder:text-ink/25 focus:ring-4 focus:ring-blue/25"
            />
          </label>
        )}

        {error ? (
          <p className="rounded-2xl border-2 border-ink bg-koi px-4 py-3 text-sm font-semibold text-paper">
            {error}
          </p>
        ) : null}
      </div>
    </Screen>
  );
}
