export interface MatchPlayer {
  name: string;
  score: number;
}

export type MatchEnding = "target" | "timeout";

export interface MatchRow {
  id: string;
  room_code: string;
  winner_name: string | null;
  players: MatchPlayer[];
  rounds: number;
  closed_by: MatchEnding;
  finished_at: string;
}

export interface RankingRow {
  name: string;
  wins: number;
  matches: number;
  fish: number;
}
