"use client";

import { useEffect, useState } from "react";
import { brand } from "@/data/copy";

interface RoomCodeProps {
  code: string;
  hint?: string;
}

type Feedback = "IDLE" | "COPIED" | "SHARED" | "FAILED";

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);

      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function RoomCode({ code, hint }: RoomCodeProps) {
  const [feedback, setFeedback] = useState<Feedback>("IDLE");

  useEffect(() => {
    if (feedback === "IDLE") {
      return;
    }

    const timer = window.setTimeout(() => setFeedback("IDLE"), 2400);

    return () => window.clearTimeout(timer);
  }, [feedback]);

  const invite = `Entra na minha mesa de ${brand.name}: ${typeof window === "undefined" ? "" : window.location.origin} · código ${code}`;

  const onCopy = async () => {
    setFeedback((await copyText(code)) ? "COPIED" : "FAILED");
  };

  const onShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: brand.name, text: invite });
        setFeedback("SHARED");

        return;
      } catch {
        setFeedback("IDLE");
      }
    }

    setFeedback((await copyText(invite)) ? "SHARED" : "FAILED");
  };

  const message =
    feedback === "COPIED"
      ? "Copiado!"
      : feedback === "SHARED"
        ? "Convite pronto para enviar"
        : feedback === "FAILED"
          ? "Não deu para copiar. Selecione o código."
          : (hint ?? "Toque no código para copiar");

  return (
    <div className="edge-card rounded-3xl border-4 border-ink bg-paper p-5 text-center">
      <span className="display block text-xs uppercase tracking-[0.2em] text-ink/50">
        Código da mesa
      </span>

      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copiar o código ${code}`}
        className="display mt-1 block w-full cursor-pointer select-all rounded-2xl px-2 py-1 text-5xl tracking-[0.18em] text-koi transition-colors hover:bg-foam active:bg-foam sm:text-6xl"
      >
        {code}
      </button>

      <span
        aria-live="polite"
        className={`mt-1 block text-xs font-semibold ${
          feedback === "FAILED" ? "text-koi" : "text-ink/55"
        }`}
      >
        {message}
      </span>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onCopy}
          className="display flex-1 cursor-pointer rounded-2xl border-2 border-ink bg-paper px-4 py-2.5 text-sm text-ink shadow-[0_4px_0_var(--color-ink)] transition-all duration-150 hover:-translate-y-[2px] hover:bg-foam active:translate-y-[2px]"
        >
          Copiar código
        </button>

        <button
          type="button"
          onClick={onShare}
          className="display flex-1 cursor-pointer rounded-2xl border-2 border-ink bg-cyan px-4 py-2.5 text-sm text-ink shadow-[0_4px_0_var(--color-ink)] transition-all duration-150 hover:-translate-y-[2px] hover:bg-shallow active:translate-y-[2px]"
        >
          Chamar a galera
        </button>
      </div>
    </div>
  );
}
