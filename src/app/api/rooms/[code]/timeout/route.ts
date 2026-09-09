import { handle } from "@/app/api/_shared";
import { expireWriting } from "@/lib/game/rounds";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;

    return expireWriting({ code });
  });
}
