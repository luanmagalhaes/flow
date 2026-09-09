const accents = /[̀-ͯ]/g;
const punctuation = /[^\p{L}\p{N}\s]/gu;
const spaces = /\s+/g;

export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(accents, "")
    .toLowerCase()
    .replace(punctuation, " ")
    .replace(spaces, " ")
    .trim();
}

export function editDistance(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (a.length === 0) {
    return b.length;
  }

  if (b.length === 0) {
    return a.length;
  }

  const rows: number[][] = [];

  for (let i = 0; i <= a.length; i += 1) {
    rows.push(new Array<number>(b.length + 1).fill(0));
    rows[i][0] = i;
  }

  for (let j = 0; j <= b.length; j += 1) {
    rows[0][j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
      }
    }
  }

  return rows[a.length][b.length];
}

export function closeEnough(a: string, b: string): boolean {
  if (a === b) {
    return true;
  }

  const longest = Math.max(a.length, b.length);

  if (longest < 5) {
    return false;
  }

  const tolerance = longest <= 8 ? 1 : longest <= 14 ? 2 : 3;

  return editDistance(a, b) <= tolerance;
}
