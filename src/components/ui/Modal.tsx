"use client";

import type { ReactNode } from "react";

interface ModalProps {
  head: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  tone?: string;
  width?: "sm" | "md";
}

export function Modal({ head, children, footer, tone = "bg-deep text-paper", width = "sm" }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4 sm:items-center">
      <div
        className={`animate-card-slide flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-[1.75rem] border-4 border-ink bg-paper shadow-[0_14px_0_var(--color-ink)] ${
          width === "md" ? "max-w-md" : "max-w-sm"
        }`}
      >
        <div className={`shrink-0 p-5 ${tone}`}>{head}</div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">{children}</div>

        {footer ? (
          <div className="shrink-0 border-t-2 border-ink/10 bg-paper px-5 pb-5 pt-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
