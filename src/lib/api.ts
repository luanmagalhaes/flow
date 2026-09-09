import type { EventRow, PlayerRow, RevealedAnswer, RoomRow } from "@/types/room";
import type { AnswerGroup } from "@/lib/game/grouping";
import type { DeckKind } from "@/data/prompts";

export interface JoinResponse {
  code: string;
  playerId: string;
  accessToken: string;
  name: string;
}

export interface RoomState {
  room: RoomRow;
  players: PlayerRow[];
  events: EventRow[];
  meId: string | null;
  submittedIds: string[];
  myAnswer: string | null;
  answers: RevealedAnswer[];
}

const statusMessages: Record<number, string> = {
  400: "esse pedido não fazia sentido para a mesa",
  401: "sua sessão nesta mesa não vale mais, entre de novo",
  403: "essa ação não é sua para fazer agora",
  404: "não encontrei essa mesa",
  409: "isso não cabe no momento da partida",
  422: "faltou preencher algo",
  429: "muitos toques seguidos, espere um instante",
  500: "a mesa tropeçou aqui do lado do servidor",
  502: "a mesa está fora do ar por um instante",
  503: "a mesa está fora do ar por um instante",
  504: "a mesa demorou demais para responder",
};

function offlineMessage(): string {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "você está sem internet, a mesa continua esperando";
  }

  return "não conseguimos falar com a mesa, tentando de novo";
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("x-player-token", token);
  }

  let response: Response;

  try {
    response = await fetch(path, { ...init, headers, cache: "no-store" });
  } catch {
    throw new Error(offlineMessage());
  }

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const given = (payload as { error?: string } | null)?.error;

    throw new Error(given ?? statusMessages[response.status] ?? "algo deu errado na mesa");
  }

  if (payload === null) {
    throw new Error("a mesa respondeu de um jeito que não entendi");
  }

  return payload as T;
}

export const api = {
  createRoom: (hostName: string, deck: DeckKind) =>
    request<JoinResponse>("/api/rooms", {
      method: "POST",
      body: JSON.stringify({ hostName, deck }),
    }),

  joinRoom: (code: string, name: string) =>
    request<JoinResponse>(`/api/rooms/${code}/join`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  state: (code: string, token?: string) =>
    request<RoomState>(`/api/rooms/${code}`, { method: "GET" }, token),

  start: (code: string, token: string) =>
    request<{ started: true; readerName: string; school: number }>(
      `/api/rooms/${code}/start`,
      { method: "POST" },
      token,
    ),

  draw: (code: string, token: string) =>
    request<{ roundNumber: number; prompt: { id: string; body: string } }>(
      `/api/rooms/${code}/draw`,
      { method: "POST" },
      token,
    ),

  answer: (code: string, token: string, body: string) =>
    request<{ saved: true; submitted: number; total: number; everyone: boolean }>(
      `/api/rooms/${code}/answer`,
      { method: "POST", body: JSON.stringify({ body }) },
      token,
    ),

  reveal: (code: string, token: string) =>
    request<{ revealed: true; groups: AnswerGroup[] }>(
      `/api/rooms/${code}/reveal`,
      { method: "POST" },
      token,
    ),

  merge: (code: string, token: string, sourceKey: string, targetKey: string) =>
    request<{ groups: AnswerGroup[] }>(
      `/api/rooms/${code}/adjust`,
      { method: "POST", body: JSON.stringify({ action: "MERGE", sourceKey, targetKey }) },
      token,
    ),

  split: (code: string, token: string, playerId: string) =>
    request<{ groups: AnswerGroup[] }>(
      `/api/rooms/${code}/adjust`,
      { method: "POST", body: JSON.stringify({ action: "SPLIT", playerId }) },
      token,
    ),

  confirm: (code: string, token: string) =>
    request<{ finished: boolean; winnerId: string | null }>(
      `/api/rooms/${code}/confirm`,
      { method: "POST" },
      token,
    ),

  timeout: (code: string) =>
    request<{ revealed: boolean }>(`/api/rooms/${code}/timeout`, { method: "POST" }),

  removePlayer: (code: string, token: string, playerId: string) =>
    request<{ removed: true; name: string }>(
      `/api/rooms/${code}/remove`,
      { method: "POST", body: JSON.stringify({ playerId }) },
      token,
    ),

  leave: (code: string, token: string) =>
    request<{ left: true; lastOne: boolean }>(
      `/api/rooms/${code}/leave`,
      { method: "POST" },
      token,
    ),
};
