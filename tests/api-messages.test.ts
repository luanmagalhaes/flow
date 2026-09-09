import { describe, expect, it } from "vitest";

const statusMessages: Record<number, string> = {
  400: "esse pedido não fazia sentido para a mesa",
  401: "sua sessão nesta mesa não vale mais, entre de novo",
  403: "essa ação não é sua para fazer agora",
  404: "não encontrei essa mesa",
  409: "isso não cabe no momento da partida",
  422: "faltou preencher algo",
  429: "muitos toques seguidos, espere um instante",
  500: "a mesa tropeçou aqui do lado do servidor",
  502: "a mesa está fora do ar por um instante",
  503: "a mesa está fora do ar por um instante",
  504: "a mesa demorou demais para responder",
};

describe("mensagens de falha mostradas na mesa", () => {
  it("cobre todos os status que o servidor devolve", () => {
    for (const status of [400, 401, 403, 404, 409, 422, 500]) {
      expect(statusMessages[status]).toBeTruthy();
    }
  });

  it("não deixa passar texto em inglês", () => {
    const english = /\b(failed|error|fetch|request|unauthorized|forbidden|not found)\b/i;

    for (const message of Object.values(statusMessages)) {
      expect(message).not.toMatch(english);
    }
  });

  it("escreve em minúscula, para encaixar em qualquer frase", () => {
    for (const message of Object.values(statusMessages)) {
      expect(message[0]).toBe(message[0].toLowerCase());
    }
  });
});
