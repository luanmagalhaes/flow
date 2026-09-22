import { handle, playerToken } from "@/app/api/_shared";
import { faces } from "@/data/faces";
import { ServiceError } from "@/lib/errors";
import { loadPlayer, loadRoom } from "@/lib/game/shared";
import { serverClient } from "@/lib/supabase";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const room = await loadRoom(code);
    const me = await loadPlayer(room, playerToken(request));
    const body = (await request.json()) as { emoji?: string };

    if (!body.emoji || !faces.includes(body.emoji)) {
      throw new ServiceError("Escolha um dos bichinhos da lista", 422);
    }

    await serverClient()
      .from("fl_players")
      .update({ emoji: body.emoji, avatar: null })
      .eq("id", me.id);

    return { emoji: body.emoji };
  });
}
