import { handle } from "@/app/api/_shared";
import { tickRound } from "@/lib/game/rounds";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;

    return tickRound({ code });
  });
}
