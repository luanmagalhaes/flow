import { handle, playerToken } from "@/app/api/_shared";
import { submitAnswer } from "@/lib/game/rounds";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const body = await request.json();

    return submitAnswer({
      code,
      token: playerToken(request),
      body: String(body.body ?? ""),
    });
  });
}
