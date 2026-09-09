"use client";

import { Button } from "@/components/ui/Button";
import { Fish } from "@/components/ui/Fish";
import { Modal } from "@/components/ui/Modal";
import type { RoomNotice } from "@/types/room";

interface NoticeModalProps {
  notice: RoomNotice;
  onClose: () => void;
}

const tones: Record<RoomNotice["kind"], string> = {
  REMOVED: "bg-koi text-paper",
  LEFT: "bg-deep text-paper",
  HOST_CHANGED: "bg-cyan text-ink",
  TIMEOUT: "bg-blue text-paper",
};

export function NoticeModal({ notice, onClose }: NoticeModalProps) {
  return (
    <Modal
      tone={tones[notice.kind]}
      head={
        <div className="flex items-center gap-3">
          <Fish className="w-12 shrink-0" tone="soft" />
          <span className="display text-lg leading-tight">{notice.title}</span>
        </div>
      }
      footer={
        <Button variant="ink" size="lg" fullWidth onClick={onClose}>
          Beleza
        </Button>
      }
    >
      <p className="text-sm text-ink/75">{notice.text}</p>
    </Modal>
  );
}
