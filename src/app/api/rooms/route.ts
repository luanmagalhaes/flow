import { handle } from "@/app/api/_shared";
import { createRoom } from "@/lib/game/rooms";
import type { DeckKind } from "@/data/prompts";

const decks: DeckKind[] = ["GENERAL", "SPICY", "MIXED"];

export async function POST(request: Request) {
  return handle(async () => {
    const body = await request.json();
    const deck = decks.includes(body.deck) ? (body.deck as DeckKind) : "GENERAL";

    return createRoom({ hostName: String(body.hostName ?? ""), deck });
  });
}
