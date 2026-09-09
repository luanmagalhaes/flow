import { handle, playerToken } from "@/app/api/_shared";
import { revealRound } from "@/lib/game/rounds";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;

    return revealRound({ code, token: playerToken(request) });
  });
}
