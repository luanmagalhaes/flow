export interface Chunk {
  text: string;
  isName: boolean;
}

export function splitByNames(text: string, names: readonly string[] = []): Chunk[] {
  const wanted = [...new Set(names.filter((name) => name.trim().length > 0))].sort(
    (a, b) => b.length - a.length,
  );

  if (wanted.length === 0) {
    return [{ text, isName: false }];
  }

  let chunks: Chunk[] = [{ text, isName: false }];

  for (const name of wanted) {
    const next: Chunk[] = [];

    for (const chunk of chunks) {
      if (chunk.isName) {
        next.push(chunk);

        continue;
      }

      let rest = chunk.text;
      let at = rest.indexOf(name);

      while (at !== -1) {
        if (at > 0) {
          next.push({ text: rest.slice(0, at), isName: false });
        }

        next.push({ text: name, isName: true });
        rest = rest.slice(at + name.length);
        at = rest.indexOf(name);
      }

      if (rest.length > 0) {
        next.push({ text: rest, isName: false });
      }
    }

    chunks = next;
  }

  return chunks.filter((chunk) => chunk.text.length > 0);
}
