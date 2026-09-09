import { randomUUID } from "node:crypto";
import { ServiceError } from "@/lib/errors";
import { serverClient } from "@/lib/supabase";
import type { PlayerRow, RoomNotice, RoomRow } from "@/types/room";

export { maxAnswerLength, maxPlayers, minPlayers } from "@/lib/game/limits";

export function createToken(): string {
  return randomUUID().replace(/-/g, "");
}

export function createCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 6; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

export async function loadRoom(code: string): Promise<RoomRow> {
  const { data, error } = await serverClient()
    .from("fl_rooms")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (error) {
    throw new ServiceError(error.message, 500);
  }

  if (!data) {
    throw new ServiceError("sala não encontrada", 404);
  }

  return data as RoomRow;
}

export async function loadPlayer(room: RoomRow, token: string): Promise<PlayerRow> {
  const client = serverClient();
  const { data: secret } = await client
    .from("fl_player_secrets")
    .select("player_id")
    .eq("room_id", room.id)
    .eq("access_token", token)
    .maybeSingle();

  if (!secret) {
    throw new ServiceError("sessão inválida para esta sala", 401);
  }

  const { data: player } = await client
    .from("fl_players")
    .select("*")
    .eq("id", secret.player_id as string)
    .maybeSingle();

  if (!player) {
    throw new ServiceError("jogador não está mais na sala", 404);
  }

  return player as PlayerRow;
}

export async function roster(roomId: string): Promise<PlayerRow[]> {
  const { data } = await serverClient()
    .from("fl_players")
    .select("*")
    .eq("room_id", roomId)
    .order("seat");

  return (data ?? []) as PlayerRow[];
}

export async function record(input: {
  roomId: string;
  type: string;
  actorId?: string | null;
  detail?: string | null;
}): Promise<void> {
  const client = serverClient();
  const { data: sequence } = await client.rpc("fl_next_sequence", { p_room: input.roomId });

  await client.from("fl_events").insert({
    room_id: input.roomId,
    sequence: (sequence as number | null) ?? 0,
    type: input.type,
    actor_id: input.actorId ?? null,
    detail: input.detail ?? null,
  });
}

export async function publishNotice(input: {
  roomId: string;
  kind: RoomNotice["kind"];
  title: string;
  text: string;
}): Promise<void> {
  const notice: RoomNotice = {
    id: `${input.roomId}-${Date.now()}`,
    kind: input.kind,
    title: input.title,
    text: input.text,
  };

  await serverClient().from("fl_rooms").update({ last_notice: notice }).eq("id", input.roomId);
}

export function assertReader(room: RoomRow, player: PlayerRow): void {
  if (room.reader_player_id !== player.id) {
    throw new ServiceError("só quem leu a carta pode fazer isso", 403);
  }
}
