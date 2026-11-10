import { handle } from "@/app/api/_shared";
import { closeStaleMatches } from "@/lib/game/rooms";
import { joinRoom } from "@/lib/game/rooms";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    await closeStaleMatches();

    const { code } = await context.params;
    const body = await request.json();

    return joinRoom({ code, name: String(body.name ?? "") });
  });
}
