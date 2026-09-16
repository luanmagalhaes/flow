import { describe, expect, it } from "vitest";
import { countUnread, unreadLabel } from "@/lib/game/unread";
import type { ChatMessage } from "@/types/room";

function message(id: string, playerId: string): ChatMessage {
  return {
    id,
    player_id: playerId,
    author_name: playerId,
    kind: "TEXT",
    body: id,
    audio_path: null,
    audio_seconds: null,
    created_at: new Date().toISOString(),
  };
}

const me = "lulu";

describe("countUnread", () => {
  it("conta tudo de outra pessoa quando nada foi visto", () => {
    const feed = [message("a", "mi"), message("b", "ca")];

    expect(countUnread(feed, null, me)).toBe(2);
  });

  it("não conta as minhas mensagens", () => {
    const feed = [message("a", me), message("b", "mi"), message("c", me)];

    expect(countUnread(feed, null, me)).toBe(1);
  });

  it("conta só o que chegou depois da última vista", () => {
    const feed = [message("a", "mi"), message("b", "mi"), message("c", "ca")];

    expect(countUnread(feed, "a", me)).toBe(2);
    expect(countUnread(feed, "b", me)).toBe(1);
    expect(countUnread(feed, "c", me)).toBe(0);
  });

  it("zera quando a última vista é a última do feed", () => {
    const feed = [message("a", "mi")];

    expect(countUnread(feed, "a", me)).toBe(0);
  });

  it("conta tudo quando a marca não está mais no feed", () => {
    const feed = [message("b", "mi"), message("c", "mi")];

    expect(countUnread(feed, "sumiu", me)).toBe(2);
  });

  it("não conta nada num feed vazio", () => {
    expect(countUnread([], null, me)).toBe(0);
  });
});

describe("unreadLabel", () => {
  it("mostra o número até o limite", () => {
    expect(unreadLabel(1)).toBe("1");
    expect(unreadLabel(9)).toBe("9");
  });

  it("satura acima do limite", () => {
    expect(unreadLabel(10)).toBe("9+");
    expect(unreadLabel(48)).toBe("9+");
  });
});
