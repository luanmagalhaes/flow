export const RoomPhase = {
  Lobby: "LOBBY",
  Playing: "PLAYING",
  Finished: "FINISHED",
} as const;

export type RoomPhase = (typeof RoomPhase)[keyof typeof RoomPhase];

export const RoundPhase = {
  Idle: "IDLE",
  Writing: "WRITING",
  Reveal: "REVEAL",
} as const;

export type RoundPhase = (typeof RoundPhase)[keyof typeof RoundPhase];

export interface RoomNotice {
  id: string;
  kind: "REMOVED" | "LEFT" | "HOST_CHANGED" | "TIMEOUT";
  title: string;
  text: string;
}

export interface RoundGroupView {
  key: string;
  label: string;
  playerIds: string[];
}

export interface RoundReport {
  id: string;
  roundNumber: number;
  promptBody: string;
  groups: RoundGroupView[];
  majoritySize: number;
  savedPlayerIds: string[];
  hookedPlayerIds: string[];
  everyoneAlone: boolean;
  fishLeft: number;
}

export interface RoomRow {
  id: string;
  code: string;
  phase: RoomPhase;
  deck: "GENERAL" | "SPICY" | "MIXED";
  school_size: number;
  fish_left: number;
  write_seconds: number;
  host_player_id: string | null;
  reader_player_id: string | null;
  winner_player_id: string | null;
  round_number: number;
  round_phase: RoundPhase;
  current_prompt_id: string | null;
  round_started_at: string | null;
  last_notice: RoomNotice | null;
  last_round: RoundReport | null;
  used_prompts: string[];
}

export interface PlayerRow {
  id: string;
  room_id: string;
  name: string;
  seat: number;
  is_host: boolean;
  fish: number;
}

export interface RevealedAnswer {
  playerId: string;
  body: string;
  groupKey: string;
}

export interface EventRow {
  id: number;
  sequence: number;
  type: string;
  actor_id: string | null;
  detail: string | null;
  created_at: string;
}
