"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type RoomState } from "@/lib/api";

const pollMs = 1500;

export function useRoom(code: string | null, token: string | null) {
  const [state, setState] = useState<RoomState | null>(null);

  const refresh = useCallback(async () => {
    if (!code) {
      return;
    }

    try {
      setState(await api.state(code, token ?? undefined));
    } catch {
      return;
    }
  }, [code, token]);

  useEffect(() => {
    if (!code) {
      return;
    }

    let alive = true;

    const tick = async () => {
      if (!alive) {
        return;
      }

      try {
        const next = await api.state(code, token ?? undefined);

        if (alive) {
          setState(next);
        }
      } catch {
        return;
      }
    };

    void tick();

    const timer = window.setInterval(() => void tick(), pollMs);

    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [code, token]);

  return { state: code ? state : null, refresh };
}
