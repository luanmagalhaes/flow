import { handle, playerToken } from "@/app/api/_shared";
import { adjustGroups } from "@/lib/game/rounds";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const body = await request.json();
    const action = body.action === "SPLIT" ? "SPLIT" : "MERGE";

    return adjustGroups({
      code,
      token: playerToken(request),
      action,
      sourceKey: typeof body.sourceKey === "string" ? body.sourceKey : undefined,
      targetKey: typeof body.targetKey === "string" ? body.targetKey : undefined,
      playerId: typeof body.playerId === "string" ? body.playerId : undefined,
    });
  });
}
