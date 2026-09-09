import { ServiceError } from "@/lib/errors";
import { serverClient } from "@/lib/supabase";
import { promptById, promptsForDeck } from "@/data/prompts";
import { groupAnswers, mergeGroups, splitPlayer, type AnswerGroup } from "@/lib/game/grouping";
import { nextSeat, secondsLeft } from "@/lib/game/rotation";
import { fishPerMiss, leaders, schoolExhausted, scoreRound } from "@/lib/game/scoring";
import {
  assertReader,
  loadPlayer,
  loadRoom,
  maxAnswerLength,
  publishNotice,
  record,
  roster,
} from "@/lib/game/shared";
import { normalize } from "@/lib/game/text";
import { RoomPhase, RoundPhase, type RoomRow, type RoundReport } from "@/types/room";

function assertPlaying(room: RoomRow): void {
  if (room.phase !== RoomPhase.Playing) {
    throw new ServiceError("a partida não está em andamento", 409);
  }
}

async function answersFor(roomId: string, roundNumber: number) {
  const { data } = await serverClient()
    .from("fl_answers")
    .select("player_id, body, group_key")
    .eq("room_id", roomId)
    .eq("round_number", roundNumber);

  return data ?? [];
}

function groupsFromRows(
  rows: readonly { player_id: string; body: string; group_key: string | null }[],
): AnswerGroup[] {
  const byKey = new Map<string, AnswerGroup>();

  for (const row of rows) {
    const key = row.group_key ?? normalize(row.body);
    const existing = byKey.get(key);

    if (existing) {
      existing.playerIds.push(row.player_id);
    } else {
      byKey.set(key, { key, label: row.body.trim(), playerIds: [row.player_id] });
    }
  }

  return [...byKey.values()].sort(
    (a, b) => b.playerIds.length - a.playerIds.length || a.key.localeCompare(b.key),
  );
}

async function persistGroups(roomId: string, roundNumber: number, groups: readonly AnswerGroup[]) {
  const client = serverClient();

  for (const group of groups) {
    for (const playerId of group.playerIds) {
      await client
        .from("fl_answers")
        .update({ group_key: group.key })
        .eq("room_id", roomId)
        .eq("round_number", roundNumber)
        .eq("player_id", playerId);
    }
  }
}

export async function drawPrompt(input: { code: string; token: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);

  assertPlaying(room);
  assertReader(room, me);

  if (room.round_phase !== RoundPhase.Idle) {
    throw new ServiceError("a rodada já está em andamento", 409);
  }

  const used = new Set(room.used_prompts);
  const available = promptsForDeck(room.deck).filter((prompt) => !used.has(prompt.id));

  if (available.length === 0) {
    return finishByPrompts(room);
  }

  const prompt = available[Math.floor(Math.random() * available.length)];
  const roundNumber = room.round_number + 1;

  await client
    .from("fl_rooms")
    .update({
      round_number: roundNumber,
      round_phase: RoundPhase.Writing,
      current_prompt_id: prompt.id,
      round_started_at: new Date().toISOString(),
      used_prompts: [...room.used_prompts, prompt.id],
      last_round: null,
    })
    .eq("id", room.id);

  await record({
    roomId: room.id,
    type: "PROMPT_DRAWN",
    actorId: me.id,
    detail: prompt.body,
  });

  return { roundNumber, prompt: { id: prompt.id, body: prompt.body } };
}

export async function submitAnswer(input: { code: string; token: string; body: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);

  assertPlaying(room);

  if (room.round_phase !== RoundPhase.Writing) {
    throw new ServiceError("a lousa está fechada agora", 409);
  }

  const body = input.body.trim();

  if (body.length === 0) {
    throw new ServiceError("escreva algo na lousa", 422);
  }

  if (body.length > maxAnswerLength) {
    throw new ServiceError(`a resposta pode ter no máximo ${maxAnswerLength} letras`, 422);
  }

  const normalized = normalize(body);

  if (normalized.length === 0) {
    throw new ServiceError("escreva pelo menos uma letra ou número", 422);
  }

  const { error } = await client.from("fl_answers").upsert(
    {
      room_id: room.id,
      round_number: room.round_number,
      player_id: me.id,
      body,
      normalized,
      group_key: normalized,
    },
    { onConflict: "room_id,round_number,player_id" },
  );

  if (error) {
    throw new ServiceError(error.message, 500);
  }

  const people = await roster(room.id);
  const rows = await answersFor(room.id, room.round_number);

  return {
    saved: true as const,
    submitted: rows.length,
    total: people.length,
    everyone: rows.length >= people.length,
  };
}

export async function revealRound(input: { code: string; token?: string; forced?: boolean }) {
  const client = serverClient();
  const room = await loadRoom(input.code);

  assertPlaying(room);

  if (room.round_phase !== RoundPhase.Writing) {
    throw new ServiceError("não há lousa para revelar", 409);
  }

  const people = await roster(room.id);
  const rows = await answersFor(room.id, room.round_number);

  if (input.token) {
    const me = await loadPlayer(room, input.token);

    if (rows.length < people.length) {
      assertReader(room, me);
    }
  }

  if (rows.length === 0) {
    throw new ServiceError("ninguém escreveu nada ainda", 409);
  }

  const groups = groupAnswers(
    rows.map((row) => ({ playerId: row.player_id as string, body: row.body as string })),
  );

  await persistGroups(room.id, room.round_number, groups);

  await client
    .from("fl_rooms")
    .update({ round_phase: RoundPhase.Reveal })
    .eq("id", room.id);

  await record({
    roomId: room.id,
    type: "ROUND_REVEALED",
    actorId: room.reader_player_id,
    detail: `${rows.length} de ${people.length} responderam`,
  });

  return { revealed: true as const, groups };
}

export async function adjustGroups(input: {
  code: string;
  token: string;
  action: "MERGE" | "SPLIT";
  sourceKey?: string;
  targetKey?: string;
  playerId?: string;
}) {
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);

  assertPlaying(room);
  assertReader(room, me);

  if (room.round_phase !== RoundPhase.Reveal) {
    throw new ServiceError("só dá para ajustar durante a revelação", 409);
  }

  const rows = await answersFor(room.id, room.round_number);
  const current = groupsFromRows(
    rows.map((row) => ({
      player_id: row.player_id as string,
      body: row.body as string,
      group_key: row.group_key as string | null,
    })),
  );

  let next: AnswerGroup[];

  if (input.action === "MERGE") {
    if (!input.sourceKey || !input.targetKey) {
      throw new ServiceError("informe os dois grupos que viram um", 422);
    }

    next = mergeGroups(current, input.sourceKey, input.targetKey);

    if (next.length === current.length) {
      throw new ServiceError("esses grupos não podem ser juntados", 422);
    }
  } else {
    if (!input.playerId) {
      throw new ServiceError("informe quem sai do grupo", 422);
    }

    const own = rows.find((row) => row.player_id === input.playerId);

    if (!own) {
      throw new ServiceError("essa pessoa não respondeu nesta rodada", 404);
    }

    next = splitPlayer(current, input.playerId, own.body as string);
  }

  await persistGroups(room.id, room.round_number, next);

  await record({
    roomId: room.id,
    type: input.action === "MERGE" ? "GROUPS_MERGED" : "GROUP_SPLIT",
    actorId: me.id,
  });

  return { groups: next };
}

async function finishByPrompts(room: RoomRow) {
  const client = serverClient();
  const people = await roster(room.id);
  const front = leaders(people.map((person) => ({ playerId: person.id, fish: person.fish })));

  await client
    .from("fl_rooms")
    .update({
      phase: RoomPhase.Finished,
      finished_at: new Date().toISOString(),
      winner_player_id: front[0]?.playerId ?? null,
      round_phase: RoundPhase.Idle,
      current_prompt_id: null,
    })
    .eq("id", room.id);

  await record({
    roomId: room.id,
    type: "MATCH_WON",
    actorId: front[0]?.playerId ?? null,
    detail: "as cartas do baralho acabaram",
  });

  throw new ServiceError("as cartas acabaram, a partida terminou", 409);
}

export async function confirmRound(input: { code: string; token: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);

  assertPlaying(room);
  assertReader(room, me);

  if (room.round_phase !== RoundPhase.Reveal) {
    throw new ServiceError("essa rodada ainda não foi revelada", 409);
  }

  const people = await roster(room.id);
  const rows = await answersFor(room.id, room.round_number);
  const groups = groupsFromRows(
    rows.map((row) => ({
      player_id: row.player_id as string,
      body: row.body as string,
      group_key: row.group_key as string | null,
    })),
  );

  const outcome = scoreRound(groups);
  const handed = outcome.hookedPlayerIds.length * fishPerMiss;
  const over = schoolExhausted(room.fish_left, handed);
  const fishLeft = Math.max(0, room.fish_left - handed);

  for (const playerId of outcome.hookedPlayerIds) {
    const person = people.find((candidate) => candidate.id === playerId);

    if (person) {
      await client
        .from("fl_players")
        .update({ fish: person.fish + fishPerMiss })
        .eq("id", playerId);
    }
  }

  const prompt = room.current_prompt_id ? promptById(room.current_prompt_id) : undefined;
  const report: RoundReport = {
    id: `${room.id}-${room.round_number}`,
    roundNumber: room.round_number,
    promptBody: prompt?.body ?? "",
    groups: groups.map((group) => ({
      key: group.key,
      label: group.label,
      playerIds: group.playerIds,
    })),
    majoritySize: outcome.majoritySize,
    savedPlayerIds: outcome.savedPlayerIds,
    hookedPlayerIds: outcome.hookedPlayerIds,
    everyoneAlone: outcome.everyoneAlone,
    fishLeft,
  };

  const following = nextSeat(
    me.seat,
    people.map((person) => person.seat),
  );
  const nextReader = people.find((person) => person.seat === following) ?? people[0];

  if (over) {
    const fresh = await roster(room.id);
    const front = leaders(fresh.map((person) => ({ playerId: person.id, fish: person.fish })));

    await client
      .from("fl_rooms")
      .update({
        phase: RoomPhase.Finished,
        finished_at: new Date().toISOString(),
        winner_player_id: front[0]?.playerId ?? null,
        fish_left: fishLeft,
        round_phase: RoundPhase.Idle,
        last_round: report,
      })
      .eq("id", room.id);

    await record({
      roomId: room.id,
      type: "MATCH_WON",
      actorId: front[0]?.playerId ?? null,
      detail: "o cardume acabou",
    });

    return { report, finished: true as const, winnerId: front[0]?.playerId ?? null };
  }

  await client
    .from("fl_rooms")
    .update({
      fish_left: fishLeft,
      round_phase: RoundPhase.Idle,
      current_prompt_id: null,
      reader_player_id: nextReader.id,
      last_round: report,
    })
    .eq("id", room.id);

  await record({
    roomId: room.id,
    type: outcome.everyoneAlone ? "ROUND_SPLIT" : "ROUND_SCORED",
    actorId: me.id,
    detail: outcome.everyoneAlone
      ? "ninguém concordou com ninguém, a mesa toda pegou peixe"
      : `${outcome.hookedPlayerIds.length} pegaram peixe · maioria de ${outcome.majoritySize}`,
  });

  return { report, finished: false as const, winnerId: null };
}

export async function expireWriting(input: { code: string }) {
  const room = await loadRoom(input.code);

  if (room.phase !== RoomPhase.Playing || room.round_phase !== RoundPhase.Writing) {
    return { revealed: false as const };
  }

  if (secondsLeft(room.round_started_at, room.write_seconds, Date.now()) > 0) {
    return { revealed: false as const };
  }

  const rows = await answersFor(room.id, room.round_number);

  if (rows.length === 0) {
    await serverClient()
      .from("fl_rooms")
      .update({ round_phase: RoundPhase.Idle, current_prompt_id: null })
      .eq("id", room.id);

    await publishNotice({
      roomId: room.id,
      kind: "TIMEOUT",
      title: "Ninguém escreveu nada",
      text: "O tempo acabou e a lousa estava vazia, então a carta foi descartada.",
    });

    return { revealed: false as const };
  }

  await revealRound({ code: input.code, forced: true });

  await publishNotice({
    roomId: room.id,
    kind: "TIMEOUT",
    title: "Tempo esgotado",
    text: `A lousa fechou com ${rows.length} de ${(await roster(room.id)).length} respostas.`,
  });

  return { revealed: true as const };
}
