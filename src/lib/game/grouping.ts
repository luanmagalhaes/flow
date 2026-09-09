import { closeEnough, normalize } from "@/lib/game/text";

export interface AnswerEntry {
  playerId: string;
  body: string;
}

export interface AnswerGroup {
  key: string;
  label: string;
  playerIds: string[];
}

interface Bucket {
  key: string;
  label: string;
  playerIds: string[];
}

function bucketize(entries: readonly AnswerEntry[]): Bucket[] {
  const buckets = new Map<string, Bucket>();

  for (const entry of entries) {
    const key = normalize(entry.body);
    const existing = buckets.get(key);

    if (existing) {
      existing.playerIds.push(entry.playerId);
    } else {
      buckets.set(key, { key, label: entry.body.trim(), playerIds: [entry.playerId] });
    }
  }

  return [...buckets.values()].sort(
    (a, b) => b.playerIds.length - a.playerIds.length || a.key.localeCompare(b.key),
  );
}

export function groupAnswers(entries: readonly AnswerEntry[]): AnswerGroup[] {
  const groups: AnswerGroup[] = [];

  for (const bucket of bucketize(entries)) {
    const host = groups.find((group) => closeEnough(group.key, bucket.key));

    if (host) {
      host.playerIds.push(...bucket.playerIds);
    } else {
      groups.push({ key: bucket.key, label: bucket.label, playerIds: [...bucket.playerIds] });
    }
  }

  return groups.sort(
    (a, b) => b.playerIds.length - a.playerIds.length || a.key.localeCompare(b.key),
  );
}

export function mergeGroups(
  groups: readonly AnswerGroup[],
  sourceKey: string,
  targetKey: string,
): AnswerGroup[] {
  if (sourceKey === targetKey) {
    return [...groups];
  }

  const source = groups.find((group) => group.key === sourceKey);
  const target = groups.find((group) => group.key === targetKey);

  if (!source || !target) {
    return [...groups];
  }

  return groups
    .filter((group) => group.key !== sourceKey)
    .map((group) =>
      group.key === targetKey
        ? { ...group, playerIds: [...group.playerIds, ...source.playerIds] }
        : group,
    )
    .sort((a, b) => b.playerIds.length - a.playerIds.length || a.key.localeCompare(b.key));
}

export function splitPlayer(
  groups: readonly AnswerGroup[],
  playerId: string,
  label: string,
): AnswerGroup[] {
  const own = `solo:${playerId}`;

  return [
    ...groups
      .map((group) => ({
        ...group,
        playerIds: group.playerIds.filter((id) => id !== playerId),
      }))
      .filter((group) => group.playerIds.length > 0),
    { key: own, label, playerIds: [playerId] },
  ].sort((a, b) => b.playerIds.length - a.playerIds.length || a.key.localeCompare(b.key));
}
