"use client";

import { Button } from "@/components/ui/Button";
import { Fish } from "@/components/ui/Fish";
import { Modal } from "@/components/ui/Modal";
import { splitByNames } from "@/lib/highlight";
import type { RoomNotice } from "@/types/room";

interface NoticeModalProps {
  notice: RoomNotice;
  onClose: () => void;
}

const tones: Record<RoomNotice["kind"], string> = {
  REMOVED: "bg-koi text-paper",
  LEFT: "stage-deep text-paper",
  HOST_CHANGED: "bg-cyan text-ink",
  TIMEOUT: "bg-sand text-ink",
};

const marks: Record<RoomNotice["kind"], string> = {
  REMOVED: "Saiu da mesa",
  LEFT: "Saiu da mesa",
  HOST_CHANGED: "Novo host",
  TIMEOUT: "Tempo",
};

export function NoticeModal({ notice, onClose }: NoticeModalProps) {
  return (
    <Modal
      tone={tones[notice.kind]}
      head={
        <div className="flex flex-col items-center gap-2 text-center">
          <div className={notice.kind === "TIMEOUT" ? "animate-fish-shudder" : ""}>
            <Fish className="w-14" tone={notice.kind === "REMOVED" ? "koi" : "soft"} />
          </div>
          <span className="display rounded-full border-2 border-ink bg-paper/90 px-2.5 py-0.5 text-[0.6rem] uppercase tracking-[0.16em] text-ink">
            {marks[notice.kind]}
          </span>
          <span className="display text-2xl leading-tight text-balance">
            {splitByNames(notice.title, notice.names).map((chunk, index) =>
              chunk.isName ? (
                <span
                  key={`${chunk.text}-${index}`}
                  className="rounded-lg bg-paper px-1.5 py-0.5 text-ink"
                >
                  {chunk.text}
                </span>
              ) : (
                <span key={`plain-${index}`}>{chunk.text}</span>
              ),
            )}
          </span>
        </div>
      }
      footer={
        <Button variant="ink" size="lg" fullWidth onClick={onClose}>
          Beleza
        </Button>
      }
    >
      <p className="text-center text-base leading-snug text-ink/80">
        {splitByNames(notice.text, notice.names).map((chunk, index) =>
          chunk.isName ? (
            <strong key={`${chunk.text}-${index}`} className="display text-blue">
              {chunk.text}
            </strong>
          ) : (
            <span key={`plain-${index}`}>{chunk.text}</span>
          ),
        )}
      </p>
    </Modal>
  );
}
