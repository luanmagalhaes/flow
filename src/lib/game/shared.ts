import { randomUUID } from "node:crypto";
import { ServiceError } from "@/lib/errors";
import { serverClient } from "@/lib/supabase";
import type { PlayerRow, RoomNotice, RoomRow } from "@/types/room";

export { maxAnswerLength, maxPlayers, minPlayers } from "@/lib/game/limits";

export function createToken(): string {
  return randomUUID().replace(/-/g, "");
}

export function createCode(): string {
  return String(10 + Math.floor(Math.random() * 90));
}

export async function nextRoomCode(): Promise<string> {
  const { data, error } = await serverClient().rpc("fl_generate_code");

  if (error || typeof data !== "string") {
    return createCode();
  }

  return data;
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
    throw new ServiceError("Sala não encontrada", 404);
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
    throw new ServiceError("Sessão inválida para esta sala", 401);
  }

  const { data: player } = await client
    .from("fl_players")
    .select("*")
    .eq("id", secret.player_id as string)
    .maybeSingle();

  if (!player) {
    throw new ServiceError("Jogador não está mais na sala", 404);
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
  names?: string[];
}): Promise<void> {
  const notice: RoomNotice = {
    id: `${input.roomId}-${Date.now()}`,
    kind: input.kind,
    title: input.title,
    text: input.text,
    names: input.names?.filter((name) => name.trim().length > 0),
  };

  await serverClient().from("fl_rooms").update({ last_notice: notice }).eq("id", input.roomId);
}

export function assertReader(room: RoomRow, player: PlayerRow): void {
  if (room.reader_player_id !== player.id) {
    throw new ServiceError("Só quem leu a carta pode fazer isso", 403);
  }
}

export async function saveMatch(
  room: RoomRow,
  people: Array<{ id: string; name: string; fish: number }>,
  winnerId: string | null,
): Promise<void> {
  if (room.is_test) {
    return;
  }

  await serverClient()
    .from("fl_matches")
    .insert({
      room_code: room.code,
      winner_name: people.find((person) => person.id === winnerId)?.name ?? null,
      rounds: room.round_number ?? 0,
      players: people.map((person) => ({
        name: person.name,
        score: person.fish,
      })),
    });
}
