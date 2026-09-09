import { describe, expect, it } from "vitest";
import { answered, caught, fish, players } from "@/utils/plural";

describe("peixe no singular e no plural", () => {
  it("conta um peixe sem s", () => {
    expect(fish(1)).toBe("1 peixe");
  });

  it("põe s a partir de dois", () => {
    expect(fish(2)).toBe("2 peixes");
    expect(fish(17)).toBe("17 peixes");
  });

  it("trata zero no plural, como se fala", () => {
    expect(fish(0)).toBe("0 peixes");
  });
});

describe("quem pegou peixe na rodada", () => {
  it("usa pegou quando foi uma pessoa só", () => {
    expect(caught(1)).toBe("1 pegou peixe");
  });

  it("usa pegaram quando foi mais de uma", () => {
    expect(caught(3)).toBe("3 pegaram peixe");
  });

  it("diz ninguém quando a mesa toda escapou", () => {
    expect(caught(0)).toBe("ninguém pegou peixe");
  });
});

describe("contagem de respostas na lousa", () => {
  it("concorda o verbo com quem respondeu", () => {
    expect(answered(1, 4)).toBe("1 de 4 respondeu");
    expect(answered(3, 4)).toBe("3 de 4 responderam");
    expect(answered(0, 4)).toBe("0 de 4 responderam");
  });
});

describe("contagem de jogadores", () => {
  it("concorda jogador e jogadores", () => {
    expect(players(1)).toBe("1 jogador");
    expect(players(12)).toBe("12 jogadores");
  });
});
