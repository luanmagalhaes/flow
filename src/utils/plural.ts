export function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

export function countLabel(count: number, one: string, many: string): string {
  return `${count} ${plural(count, one, many)}`;
}

export function fish(count: number): string {
  return countLabel(count, "peixe", "peixes");
}

export function players(count: number): string {
  return countLabel(count, "jogador", "jogadores");
}

export function verb(count: number, one: string, many: string): string {
  return plural(count, one, many);
}
