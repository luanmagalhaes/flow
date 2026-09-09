export type RandomNumberGenerator = () => number;

export const systemRng: RandomNumberGenerator = () => Math.random();

export function shuffle<T>(items: readonly T[], rng: RandomNumberGenerator = systemRng): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));

    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }

  return copy;
}
