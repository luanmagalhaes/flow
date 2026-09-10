import { describe, expect, it } from "vitest";
import { splitByNames } from "@/lib/highlight";

const joined = (text: string, names: string[]) =>
  splitByNames(text, names)
    .map((chunk) => chunk.text)
    .join("");

describe("destaque dos nomes no aviso", () => {
  it("separa o nome do resto da frase", () => {
    const chunks = splitByNames("maryjane lerdou e dormiu na praia", ["maryjane"]);

    expect(chunks).toEqual([
      { text: "maryjane", isName: true },
      { text: " lerdou e dormiu na praia", isName: false },
    ]);
  });

  it("destaca dois nomes na mesma frase", () => {
    const chunks = splitByNames("Lulu tirou Millinha da mesa", ["Lulu", "Millinha"]);
    const names = chunks.filter((chunk) => chunk.isName).map((chunk) => chunk.text);

    expect(names).toEqual(["Lulu", "Millinha"]);
  });

  it("destaca o mesmo nome quando ele aparece duas vezes", () => {
    const chunks = splitByNames("Erê saiu e Erê volta depois", ["Erê"]);

    expect(chunks.filter((chunk) => chunk.isName)).toHaveLength(2);
  });

  it("nunca perde nem inventa texto", () => {
    const text = "Lulu tirou Millinha da mesa, e maryjane virou host.";

    expect(joined(text, ["Lulu", "Millinha", "maryjane"])).toBe(text);
  });

  it("prefere o nome mais longo quando um contém o outro", () => {
    const chunks = splitByNames("Ana Júlia e Ana jogaram", ["Ana", "Ana Júlia"]);
    const names = chunks.filter((chunk) => chunk.isName).map((chunk) => chunk.text);

    expect(names).toEqual(["Ana Júlia", "Ana"]);
  });

  it("devolve a frase inteira quando não há nome para destacar", () => {
    expect(splitByNames("Ninguém escreveu nada", [])).toEqual([
      { text: "Ninguém escreveu nada", isName: false },
    ]);
  });

  it("ignora nome vazio", () => {
    expect(splitByNames("Lulu saiu", ["", "  "])).toEqual([{ text: "Lulu saiu", isName: false }]);
  });

  it("aguenta nome com acento", () => {
    const chunks = splitByNames("Conceição lerdou", ["Conceição"]);

    expect(chunks[0]).toEqual({ text: "Conceição", isName: true });
  });
});
