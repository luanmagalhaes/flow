import { describe, expect, it } from "vitest";
import { groupAnswers, mergeGroups, splitPlayer } from "@/lib/game/grouping";
import { closeEnough, normalize } from "@/lib/game/text";

describe("normalização da lousa", () => {
  it("ignora caixa, acento e espaço sobrando", () => {
    expect(normalize("  MORANGO ")).toBe("morango");
    expect(normalize("Açaí")).toBe("acai");
    expect(normalize("São   Paulo")).toBe("sao paulo");
  });

  it("descarta pontuação que a pessoa digita sem pensar", () => {
    expect(normalize("pizza!")).toBe("pizza");
    expect(normalize("Homem-Aranha")).toBe("homem aranha");
    expect(normalize("...banana?")).toBe("banana");
  });
});

describe("tolerância a erro de digitação", () => {
  it("aceita um dedo errado em palavra longa", () => {
    expect(closeEnough("morango", "morrango")).toBe(true);
    expect(closeEnough("homem aranha", "homem aranhaa")).toBe(true);
  });

  it("aceita letras trocadas de ordem", () => {
    expect(closeEnough("brigadeiro", "brigadiero")).toBe(true);
  });

  it("não junta palavras curtas diferentes", () => {
    expect(closeEnough("gato", "rato")).toBe(false);
    expect(closeEnough("sim", "não")).toBe(false);
  });

  it("não junta respostas que só parecem parecidas", () => {
    expect(closeEnough("cachorro", "cavalo")).toBe(false);
  });
});

describe("agrupamento de respostas", () => {
  it("junta quem escreveu a mesma coisa com caixa diferente", () => {
    const groups = groupAnswers([
      { playerId: "a", body: "MORANGO" },
      { playerId: "b", body: "morango" },
      { playerId: "c", body: "Uva" },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].playerIds).toEqual(["a", "b"]);
    expect(groups[1].playerIds).toEqual(["c"]);
  });

  it("põe o grupo maior na frente", () => {
    const groups = groupAnswers([
      { playerId: "a", body: "uva" },
      { playerId: "b", body: "morango" },
      { playerId: "c", body: "morango" },
      { playerId: "d", body: "morango" },
    ]);

    expect(groups[0].playerIds).toHaveLength(3);
    expect(groups[0].label).toBe("morango");
  });

  it("dá o mesmo resultado independente da ordem de chegada", () => {
    const first = groupAnswers([
      { playerId: "a", body: "pizza" },
      { playerId: "b", body: "piza" },
      { playerId: "c", body: "pizza" },
    ]);
    const second = groupAnswers([
      { playerId: "c", body: "pizza" },
      { playerId: "b", body: "piza" },
      { playerId: "a", body: "pizza" },
    ]);

    expect(first.map((g) => g.playerIds.length)).toEqual(second.map((g) => g.playerIds.length));
  });

  it("usa a grafia mais popular como rótulo do grupo", () => {
    const groups = groupAnswers([
      { playerId: "a", body: "brigadeiro" },
      { playerId: "b", body: "brigadeiro" },
      { playerId: "c", body: "brigadiero" },
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("brigadeiro");
    expect(groups[0].playerIds).toHaveLength(3);
  });

  it("mantém cada um no seu grupo quando ninguém concorda", () => {
    const groups = groupAnswers([
      { playerId: "a", body: "azul" },
      { playerId: "b", body: "verde" },
      { playerId: "c", body: "roxo" },
    ]);

    expect(groups).toHaveLength(3);
  });
});

describe("ajuste manual de quem leu a carta", () => {
  const base = () =>
    groupAnswers([
      { playerId: "a", body: "cachorro" },
      { playerId: "b", body: "cachorro" },
      { playerId: "c", body: "cão" },
    ]);

  it("junta dois grupos que a mesa considerou a mesma resposta", () => {
    const merged = mergeGroups(base(), "cao", "cachorro");

    expect(merged).toHaveLength(1);
    expect(merged[0].playerIds).toHaveLength(3);
  });

  it("ignora pedido de juntar grupo que não existe", () => {
    expect(mergeGroups(base(), "inexistente", "cachorro")).toHaveLength(2);
  });

  it("ignora pedido de juntar um grupo consigo mesmo", () => {
    expect(mergeGroups(base(), "cachorro", "cachorro")).toHaveLength(2);
  });

  it("separa alguém que foi agrupado por engano", () => {
    const split = splitPlayer(base(), "b", "cachorro");

    expect(split).toHaveLength(3);
    expect(split.find((g) => g.playerIds.includes("b"))?.playerIds).toEqual(["b"]);
  });

  it("não deixa grupo vazio depois de separar", () => {
    const split = splitPlayer(base(), "c", "cão");

    expect(split.every((group) => group.playerIds.length > 0)).toBe(true);
  });
});

describe("números não são erro de digitação", () => {
  it("não junta respostas que diferem por um dígito", () => {
    expect(closeEnough("outro 2", "outro 3")).toBe(false);
    expect(closeEnough("top 10", "top 20")).toBe(false);
    expect(closeEnough("anos 90", "anos 80")).toBe(false);
  });

  it("ainda junta erro de digitação em texto sem número", () => {
    expect(closeEnough("morango", "morrango")).toBe(true);
  });

  it("junta quando o número é o mesmo e a letra escorregou", () => {
    expect(closeEnough("copa 2002", "copa 2002 ")).toBe(true);
    expect(closeEnough("ano 1990", "anno 1990")).toBe(true);
  });

  it("separa dois anos próximos, que a mesa jamais consideraria iguais", () => {
    expect(closeEnough("1990", "1991")).toBe(false);
    expect(closeEnough("copa de 1994", "copa de 1998")).toBe(false);
  });
});

describe("agrupamento com números", () => {
  it("mantém respostas numéricas distintas separadas", () => {
    const groups = groupAnswers([
      { playerId: "a", body: "1990" },
      { playerId: "b", body: "1991" },
      { playerId: "c", body: "1990" },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].playerIds.sort()).toEqual(["a", "c"]);
  });
});
