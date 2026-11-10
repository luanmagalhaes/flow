"use client";

import { useEffect } from "react";

interface PhotoViewerProps {
  name: string;
  photo: string;
  onClose: () => void;
}

export function PhotoViewer({ name, photo, onClose }: PhotoViewerProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label={`Foto de ${name}`}
      onClick={onClose}
      className="fixed inset-0 z-[64] flex items-center justify-center bg-ink/70 p-5"
    >
      <div className="animate-card-slide flex max-w-xs flex-col items-center gap-3">
        <span className="overflow-hidden rounded-[1.75rem] p-1.5 border-4 border-ink bg-paper shadow-[0_14px_0_var(--color-ink)]">
          <img
            src={photo}
            alt={`Foto de ${name}`}
            className="block h-auto w-full max-w-[16rem] rounded-[1.25rem] object-cover"
          />
        </span>
        <span className="display rounded-xl px-4 py-1.5 text-center text-lg leading-tight border-2 border-ink bg-paper text-ink">
          {name}
        </span>
        <span className="text-xs font-semibold text-white/70">Toque para fechar</span>
      </div>
    </div>
  );
}
