import { handle, playerToken } from "@/app/api/_shared";
import { roomState } from "@/lib/game/rooms";

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const token = playerToken(request);

    return roomState({ code, token: token || undefined });
  });
}
