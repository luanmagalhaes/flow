import { describe, expect, it } from "vitest";
import {
  fallbackMessage,
  messageForStatus,
  networkMessage,
  offlineMessage,
  statusMessages,
  unreachableMessage,
  unreadableMessage,
} from "@/lib/messages";

const everyMessage = [
  ...Object.values(statusMessages),
  fallbackMessage,
  unreadableMessage,
  offlineMessage,
  unreachableMessage,
];

describe("mensagens que a mesa lê", () => {
  it("começam com letra maiúscula", () => {
    for (const message of everyMessage) {
      expect(message[0]).toBe(message[0].toUpperCase());
    }
  });

  it("terminam com ponto", () => {
    for (const message of everyMessage) {
      expect(message.endsWith(".")).toBe(true);
    }
  });

  it("não têm palavra em inglês", () => {
    const english = /\b(failed|error|fetch|request|unauthorized|forbidden|not found|internal)\b/i;

    for (const message of everyMessage) {
      expect(message).not.toMatch(english);
    }
  });

  it("cobre todos os status que o servidor devolve", () => {
    for (const status of [400, 401, 403, 404, 409, 422, 500]) {
      expect(statusMessages[status]).toBeTruthy();
    }
  });

  it("cai no texto genérico num status desconhecido", () => {
    expect(messageForStatus(418)).toBe(fallbackMessage);
  });

  it("distingue sem internet de mesa fora do ar", () => {
    expect(networkMessage(false)).toBe(offlineMessage);
    expect(networkMessage(true)).toBe(unreachableMessage);
  });
});
