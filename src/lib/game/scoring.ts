import type { AnswerGroup } from "@/lib/game/grouping";

export const fishPerMiss = 1;

export interface RoundOutcome {
  majoritySize: number;
  savedPlayerIds: string[];
  hookedPlayerIds: string[];
  everyoneAlone: boolean;
}

export function scoreRound(groups: readonly AnswerGroup[]): RoundOutcome {
  const sizes = groups.map((group) => group.playerIds.length);
  const majoritySize = sizes.length > 0 ? Math.max(...sizes) : 0;
  const everyoneAlone = majoritySize <= 1;

  if (everyoneAlone) {
    return {
      majoritySize,
      savedPlayerIds: [],
      hookedPlayerIds: groups.flatMap((group) => group.playerIds),
      everyoneAlone: true,
    };
  }

  const saved = groups.filter((group) => group.playerIds.length === majoritySize);
  const hooked = groups.filter((group) => group.playerIds.length < majoritySize);

  return {
    majoritySize,
    savedPlayerIds: saved.flatMap((group) => group.playerIds),
    hookedPlayerIds: hooked.flatMap((group) => group.playerIds),
    everyoneAlone: false,
  };
}

export interface Standing {
  playerId: string;
  fish: number;
}

export function leaders(standings: readonly Standing[]): Standing[] {
  if (standings.length === 0) {
    return [];
  }

  const fewest = Math.min(...standings.map((entry) => entry.fish));

  return standings.filter((entry) => entry.fish === fewest);
}

export function schoolExhausted(fishLeft: number, aboutToHand: number): boolean {
  return fishLeft - aboutToHand <= 0;
}
