export interface MatchPlayer {
  name: string;
  score: number;
}

export interface MatchRow {
  id: string;
  room_code: string;
  winner_name: string | null;
  players: MatchPlayer[];
  rounds: number;
  finished_at: string;
}

export interface RankingRow {
  name: string;
  wins: number;
  matches: number;
  fish: number;
}
