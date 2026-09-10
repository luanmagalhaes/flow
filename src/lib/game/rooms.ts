import { ServiceError } from "@/lib/errors";
import { serverClient } from "@/lib/supabase";
import { promptsForDeck, type DeckKind } from "@/data/prompts";
import { leaders } from "@/lib/game/scoring";
import { nextSeat } from "@/lib/game/rotation";
import {
  createCode,
  createToken,
  loadPlayer,
  loadRoom,
  maxPlayers,
  minPlayers,
  publishNotice,
  record,
  roster,
} from "@/lib/game/shared";
import { RoomPhase, RoundPhase, type PlayerRow, type RoomRow } from "@/types/room";

const fishPerPlayer = 6;
const minSchool = 30;
const maxSchool = 120;

export function schoolFor(playerCount: number): number {
  return Math.min(maxSchool, Math.max(minSchool, playerCount * fishPerPlayer));
}

async function nextFreeSeat(roomId: string): Promise<number> {
  const { data } = await serverClient()
    .from("fl_players")
    .select("seat")
    .eq("room_id", roomId)
    .order("seat", { ascending: false })
    .limit(1)
    .maybeSingle();

  return ((data?.seat as number | undefined) ?? 0) + 1;
}

async function attach(room: RoomRow, name: string, isHost: boolean) {
  const client = serverClient();
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    throw new ServiceError("Escreva um nome", 422);
  }

  if (trimmed.length > 24) {
    throw new ServiceError("O nome pode ter no máximo 24 letras", 422);
  }

  const people = await roster(room.id);

  if (people.length >= maxPlayers) {
    throw new ServiceError(`A mesa já está com ${maxPlayers} jogadores`, 409);
  }

  const seat = await nextFreeSeat(room.id);
  const { data: player, error } = await client
    .from("fl_players")
    .insert({ room_id: room.id, name: trimmed, seat, is_host: isHost })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505" && error.message.includes("fl_players_name_idx")) {
      throw new ServiceError("Esse nome já está na mesa, escolha outro", 409);
    }

    throw new ServiceError(error.message, 500);
  }

  const accessToken = createToken();

  await client.from("fl_player_secrets").insert({
    player_id: (player as PlayerRow).id,
    room_id: room.id,
    access_token: accessToken,
  });

  return { player: player as PlayerRow, accessToken };
}

export async function createRoom(input: { hostName: string; deck: DeckKind }) {
  const client = serverClient();

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = createCode();
    const { data, error } = await client
      .from("fl_rooms")
      .insert({ code, deck: input.deck })
      .select("*")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        continue;
      }

      throw new ServiceError(error.message, 500);
    }

    const room = data as RoomRow;
    const { player, accessToken } = await attach(room, input.hostName, true);

    await client
      .from("fl_rooms")
      .update({ host_player_id: player.id, reader_player_id: player.id })
      .eq("id", room.id);

    await record({ roomId: room.id, type: "PLAYER_JOINED", actorId: player.id });

    return { code: room.code, playerId: player.id, accessToken, name: player.name };
  }

  throw new ServiceError("Não foi possível gerar um código de sala", 500);
}

export async function joinRoom(input: { code: string; name: string }) {
  const room = await loadRoom(input.code);

  if (room.phase === RoomPhase.Finished) {
    throw new ServiceError("Essa partida já terminou", 409);
  }

  const { player, accessToken } = await attach(room, input.name, false);

  await record({ roomId: room.id, type: "PLAYER_JOINED", actorId: player.id });

  return { code: room.code, playerId: player.id, accessToken, name: player.name };
}

export async function startMatch(input: { code: string; token: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);

  if (!me.is_host) {
    throw new ServiceError("Só o host começa a partida", 403);
  }

  if (room.phase !== RoomPhase.Lobby) {
    throw new ServiceError("A partida já começou", 409);
  }

  const people = await roster(room.id);

  if (people.length < minPlayers) {
    throw new ServiceError(`Precisa de pelo menos ${minPlayers} jogadores`, 409);
  }

  if (promptsForDeck(room.deck).length === 0) {
    throw new ServiceError("Esse baralho está vazio", 409);
  }

  const school = schoolFor(people.length);
  const first = people[Math.floor(Math.random() * people.length)];

  await client
    .from("fl_rooms")
    .update({
      phase: RoomPhase.Playing,
      started_at: new Date().toISOString(),
      school_size: school,
      fish_left: school,
      reader_player_id: first.id,
      round_phase: RoundPhase.Idle,
      round_started_at: new Date().toISOString(),
      round_number: 0,
    })
    .eq("id", room.id);

  await record({
    roomId: room.id,
    type: "MATCH_STARTED",
    actorId: me.id,
    detail: `${people.length} jogadores · cardume de ${school} peixes`,
  });

  await record({ roomId: room.id, type: "READER_PICKED", actorId: first.id });

  return { started: true as const, readerName: first.name, school };
}

export async function roomState(input: { code: string; token?: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);

  const [people, { data: events }] = await Promise.all([
    roster(room.id),
    client
      .from("fl_events")
      .select("*")
      .eq("room_id", room.id)
      .order("sequence", { ascending: false })
      .limit(25),
  ]);

  const me = input.token ? await loadPlayer(room, input.token).catch(() => null) : null;

  const { data: answers } = await client
    .from("fl_answers")
    .select("player_id, body, group_key")
    .eq("room_id", room.id)
    .eq("round_number", room.round_number);

  const rows = answers ?? [];
  const submittedIds = rows.map((row) => row.player_id as string);
  const revealed = room.round_phase === RoundPhase.Reveal;

  return {
    room,
    players: people,
    events: events ?? [],
    meId: me?.id ?? null,
    submittedIds,
    myAnswer: me ? ((rows.find((row) => row.player_id === me.id)?.body as string) ?? null) : null,
    answers: revealed
      ? rows.map((row) => ({
          playerId: row.player_id as string,
          body: row.body as string,
          groupKey: row.group_key as string,
        }))
      : [],
  };
}

async function detach(room: RoomRow, target: PlayerRow) {
  const client = serverClient();
  const people = await roster(room.id);
  const others = people.filter((person) => person.id !== target.id);

  if (others.length === 0) {
    throw new ServiceError("Não dá para esvaziar a sala", 409);
  }

  await client.from("fl_players").delete().eq("id", target.id);

  const patch: Record<string, unknown> = {};

  if (room.reader_player_id === target.id) {
    const following = nextSeat(
      target.seat,
      others.map((person) => person.seat),
    );

    patch.reader_player_id = (others.find((person) => person.seat === following) ?? others[0]).id;
    patch.round_phase = RoundPhase.Idle;
    patch.current_prompt_id = null;
  }

  let newHostName: string | null = null;

  if (room.host_player_id === target.id) {
    await client.from("fl_players").update({ is_host: true }).eq("id", others[0].id);

    patch.host_player_id = others[0].id;
    newHostName = others[0].name;
  }

  if (others.length < minPlayers && room.phase === RoomPhase.Playing) {
    const standings = others.map((person) => ({ playerId: person.id, fish: person.fish }));
    const front = leaders(standings);

    patch.phase = RoomPhase.Finished;
    patch.finished_at = new Date().toISOString();
    patch.winner_player_id = front[0]?.playerId ?? null;
  }

  if (Object.keys(patch).length > 0) {
    await client.from("fl_rooms").update(patch).eq("id", room.id);
  }

  return { newHostName, finished: patch.phase === RoomPhase.Finished };
}

export async function removePlayer(input: { code: string; token: string; playerId: string }) {
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);

  if (!me.is_host) {
    throw new ServiceError("Só o host pode remover jogadores", 403);
  }

  if (input.playerId === me.id) {
    throw new ServiceError("O host não pode remover a si mesmo", 422);
  }

  const people = await roster(room.id);
  const target = people.find((person) => person.id === input.playerId);

  if (!target) {
    throw new ServiceError("Esse jogador não está nesta sala", 404);
  }

  const outcome = await detach(room, target);

  await record({
    roomId: room.id,
    type: "PLAYER_REMOVED",
    actorId: me.id,
    detail: `tirou ${target.name} da mesa`,
  });

  await publishNotice({
    roomId: room.id,
    kind: "REMOVED",
    title: `${target.name} saiu da mesa`,
    text: outcome.newHostName
      ? `${me.name} tirou ${target.name} da mesa, e ${outcome.newHostName} virou host.`
      : `${me.name} tirou ${target.name} da partida.`,
    names: [me.name, target.name, outcome.newHostName ?? ""],
  });

  return { removed: true as const, name: target.name };
}

export async function leaveRoom(input: { code: string; token: string }) {
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);
  const people = await roster(room.id);

  if (people.length === 1) {
    await serverClient().from("fl_rooms").delete().eq("id", room.id);

    return { left: true as const, lastOne: true as const };
  }

  const outcome = await detach(room, me);

  await record({ roomId: room.id, type: "PLAYER_LEFT", actorId: me.id });

  await publishNotice({
    roomId: room.id,
    kind: "LEFT",
    title: `${me.name} saiu da partida`,
    text: outcome.newHostName
      ? `${me.name} saiu e ${outcome.newHostName} virou o host.`
      : `${me.name} saiu e a mesa segue sem essa pessoa.`,
    names: [me.name, outcome.newHostName ?? ""],
  });

  return { left: true as const, lastOne: false as const };
}
