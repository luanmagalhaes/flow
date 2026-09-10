"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Fish } from "@/components/ui/Fish";
import { brand } from "@/data/copy";

interface HowToPlayProps {
  onClose: () => void;
}

function Water({ children }: { children: ReactNode }) {
  return <strong className="display font-semibold text-blue">{children}</strong>;
}

function Deep({ children }: { children: ReactNode }) {
  return <strong className="display font-semibold text-deep">{children}</strong>;
}

function Bad({ children }: { children: ReactNode }) {
  return (
    <strong className="display font-semibold text-koi underline decoration-koi/40 decoration-2 underline-offset-2">
      {children}
    </strong>
  );
}

interface Slide {
  title: string;
  tone: string;
  art: "school" | "bad" | "good";
  body: ReactNode;
}

const slides: Slide[] = [
  {
    title: "Presta atenção, benção!",
    tone: "stage-deep text-paper",
    art: "school",
    body: (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-base leading-snug text-ink/80">
          {brand.name} não é sobre acertar a resposta <Bad>certa</Bad>.
        </p>
        <p className="display text-xl leading-tight text-deep">Não existe resposta certa.</p>
        <div className="rounded-2xl border-2 border-ink bg-foam p-3">
          <p className="text-sm leading-snug text-ink/75">
            Uma pergunta aparece e você escreve o que acha que
          </p>
          <p className="display mt-1 text-lg leading-tight text-blue">
            a maioria da mesa vai escrever
          </p>
        </div>
        <p className="text-sm leading-snug text-ink/75">
          Pensar <Water>igual todo mundo</Water> é o objetivo.
          <br />
          Ser original aqui é <Bad>perder</Bad>.
        </p>
      </div>
    ),
  },
  {
    title: "Peixe é coisa ruim",
    tone: "bg-koi text-paper",
    art: "bad",
    body: (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm leading-snug text-ink/75">
          Quem escreve <Bad>diferente da maioria</Bad> leva um peixe do cardume.
        </p>
        <div className="rounded-2xl border-2 border-ink bg-koi-soft p-3">
          <p className="display text-xl leading-tight text-ink">Peixe não é ponto.</p>
          <p className="display mt-1 text-2xl leading-tight text-koi-deep">
            Peixe é ponto negativo.
          </p>
          <p className="mt-1.5 text-xs font-semibold text-ink/70">
            Cada peixe na sua mão te afunda no placar.
          </p>
        </div>
        <p className="text-sm leading-snug text-ink/75">
          Todo mundo escreveu <Water>praia</Water> e você escreveu <Bad>montanha</Bad>?
          <br />
          O peixe é seu. Sozinho.
        </p>
      </div>
    ),
  },
  {
    title: "Sem peixe é seguir o fluxo",
    tone: "bg-cyan text-ink",
    art: "good",
    body: (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm leading-snug text-ink/75">
          Quem escreve <Water>igual à maioria</Water> não leva nada. E isso é ótimo.
        </p>
        <div className="rounded-2xl border-2 border-ink bg-shallow p-3">
          <p className="text-sm leading-snug text-ink/80">Mão vazia significa que você</p>
          <p className="display mt-1 text-2xl leading-tight text-deep">seguiu o fluxo</p>
        </div>
        <div className="rounded-2xl border-4 border-ink bg-paper p-3">
          <p className="display text-lg leading-tight text-ink">Vence quem tem</p>
          <p className="display text-3xl leading-tight text-koi">menos peixes</p>
          <p className="mt-1 text-xs font-semibold text-ink/65">
            Zero peixe é o placar perfeito. <Deep>0</Deep>
          </p>
        </div>
      </div>
    ),
  },
];

export function HowToPlay({ onClose }: HowToPlayProps) {
  const [step, setStep] = useState(0);
  const slide = slides[step];
  const last = step === slides.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/80 p-4 sm:items-center">
      <div className="animate-card-slide flex max-h-[calc(100dvh-2rem)] w-full max-w-sm flex-col overflow-hidden rounded-[1.75rem] border-4 border-ink bg-paper shadow-[0_14px_0_var(--color-ink)]">
        <div className={`shrink-0 px-5 pb-4 pt-5 text-center ${slide.tone}`}>
          <div className="flex items-end justify-center gap-2">
            {slide.art === "school" ? (
              <>
                <Fish className="w-9" tone="soft" swimming />
                <Fish className="w-12" tone="koi" swimming />
                <Fish className="w-9 scale-x-[-1]" tone="soft" swimming />
              </>
            ) : slide.art === "bad" ? (
              <div className="animate-fish-shudder">
                <Fish className="w-16" tone="koi" />
              </div>
            ) : (
              <span className="display flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-ink bg-paper text-3xl tabular-nums text-deep">
                0
              </span>
            )}
          </div>
          <h2 className="display mt-3 text-2xl leading-tight text-balance">{slide.title}</h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">{slide.body}</div>

        <div className="shrink-0 border-t-2 border-ink/10 px-5 pb-5 pt-4">
          <div className="mb-3 flex items-center justify-center gap-3">
            {slides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setStep(index)}
                aria-label={`Ir para a parte ${index + 1}: ${item.title}`}
                aria-current={index === step}
                className={`cursor-pointer transition-all duration-200 ${
                  index === step ? "scale-115" : "opacity-30 hover:opacity-70"
                }`}
              >
                <Fish
                  className="w-8"
                  tone={index === step ? "koi" : "deep"}
                  swimming={index === step}
                />
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 ? (
              <Button variant="foam" fullWidth onClick={() => setStep(step - 1)}>
                Como é mesmo?
              </Button>
            ) : null}
            <Button
              variant={last ? "koi" : "water"}
              fullWidth
              onClick={() => (last ? onClose() : setStep(step + 1))}
            >
              {last ? "Valeu, pai. Entendido" : "Saquei"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
