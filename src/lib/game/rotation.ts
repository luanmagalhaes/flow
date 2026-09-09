export function nextSeat(current: number, seats: readonly number[]): number {
  if (seats.length === 0) {
    return current;
  }

  const sorted = [...seats].sort((a, b) => a - b);
  const ahead = sorted.find((seat) => seat > current);

  return ahead ?? sorted[0];
}

export function secondsLeft(startedAt: string | null, total: number, nowMs: number): number {
  if (!startedAt) {
    return total;
  }

  const elapsed = (nowMs - new Date(startedAt).getTime()) / 1000;

  return Math.max(0, Math.ceil(total - elapsed));
}
