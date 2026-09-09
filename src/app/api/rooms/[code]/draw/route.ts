import { handle, playerToken } from "@/app/api/_shared";
import { drawPrompt } from "@/lib/game/rounds";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;

    return drawPrompt({ code, token: playerToken(request) });
  });
}
