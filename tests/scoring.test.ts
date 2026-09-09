import { describe, expect, it } from "vitest";
import { groupAnswers } from "@/lib/game/grouping";
import { leaders, schoolExhausted, scoreRound } from "@/lib/game/scoring";

function outcomeFor(bodies: Record<string, string>) {
  return scoreRound(
    groupAnswers(Object.entries(bodies).map(([playerId, body]) => ({ playerId, body }))),
  );
}

describe("quem pega peixe na rodada", () => {
  it("salva a maioria e pesca o resto", () => {
    const outcome = outcomeFor({ a: "morango", b: "morango", c: "morango", d: "uva" });

    expect(outcome.savedPlayerIds.sort()).toEqual(["a", "b", "c"]);
    expect(outcome.hookedPlayerIds).toEqual(["d"]);
    expect(outcome.majoritySize).toBe(3);
  });

  it("pesca todos os que ficaram fora, não só quem ficou sozinho", () => {
    const outcome = outcomeFor({ a: "azul", b: "azul", c: "azul", d: "verde", e: "verde" });

    expect(outcome.savedPlayerIds.sort()).toEqual(["a", "b", "c"]);
    expect(outcome.hookedPlayerIds.sort()).toEqual(["d", "e"]);
  });

  it("pesca a mesa inteira quando ninguém concorda com ninguém", () => {
    const outcome = outcomeFor({ a: "um", b: "dois", c: "tres" });

    expect(outcome.everyoneAlone).toBe(true);
    expect(outcome.savedPlayerIds).toEqual([]);
    expect(outcome.hookedPlayerIds.sort()).toEqual(["a", "b", "c"]);
  });

  it("salva os dois lados quando a mesa empata em blocos iguais", () => {
    const outcome = outcomeFor({ a: "sim", b: "sim", c: "nao", d: "nao" });

    expect(outcome.majoritySize).toBe(2);
    expect(outcome.savedPlayerIds).toHaveLength(4);
    expect(outcome.hookedPlayerIds).toEqual([]);
  });

  it("trata erro de digitação como estando com a maioria", () => {
    const outcome = outcomeFor({ a: "brigadeiro", b: "brigadeiro", c: "brigadiero", d: "pudim" });

    expect(outcome.savedPlayerIds.sort()).toEqual(["a", "b", "c"]);
    expect(outcome.hookedPlayerIds).toEqual(["d"]);
  });

  it("aguenta mesa cheia de doze pessoas", () => {
    const bodies: Record<string, string> = {};

    for (let i = 0; i < 9; i += 1) {
      bodies[`maioria-${i}`] = "praia";
    }

    bodies["fora-1"] = "montanha";
    bodies["fora-2"] = "cidade";
    bodies["fora-3"] = "montanha";

    const outcome = outcomeFor(bodies);

    expect(outcome.savedPlayerIds).toHaveLength(9);
    expect(outcome.hookedPlayerIds).toHaveLength(3);
  });
});

describe("vencedor pelo menor número de peixes", () => {
  it("aponta quem tem menos peixes", () => {
    expect(
      leaders([
        { playerId: "a", fish: 4 },
        { playerId: "b", fish: 2 },
        { playerId: "c", fish: 7 },
      ]),
    ).toEqual([{ playerId: "b", fish: 2 }]);
  });

  it("devolve todos os empatados na frente", () => {
    expect(
      leaders([
        { playerId: "a", fish: 1 },
        { playerId: "b", fish: 1 },
        { playerId: "c", fish: 5 },
      ]),
    ).toHaveLength(2);
  });

  it("aguenta mesa vazia", () => {
    expect(leaders([])).toEqual([]);
  });
});

describe("fim do cardume", () => {
  it("encerra quando os peixes acabam exatamente", () => {
    expect(schoolExhausted(3, 3)).toBe(true);
  });

  it("encerra quando a rodada pediria mais peixes do que existem", () => {
    expect(schoolExhausted(2, 5)).toBe(true);
  });

  it("segue enquanto sobrar peixe no cardume", () => {
    expect(schoolExhausted(10, 3)).toBe(false);
  });
});
