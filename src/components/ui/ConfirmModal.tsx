"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { ReactNode } from "react";

interface ConfirmModalProps {
  title: string;
  body: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "calm";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  body,
  confirmLabel,
  cancelLabel = "Voltar",
  tone = "calm",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      tone={tone === "danger" ? "bg-koi text-paper" : "bg-deep text-paper"}
      head={<span className="display block text-xl leading-tight">{title}</span>}
      footer={
        <div className="flex flex-col gap-2">
          <Button
            variant={tone === "danger" ? "koi" : "ink"}
            size="lg"
            fullWidth
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Um instante..." : confirmLabel}
          </Button>
          <button
            type="button"
            onClick={onCancel}
            className="display cursor-pointer rounded-xl px-3 py-2 text-sm text-ink/55 transition-colors hover:text-ink"
          >
            {cancelLabel}
          </button>
        </div>
      }
    >
      <div className="text-sm text-ink/75">{body}</div>
    </Modal>
  );
}
