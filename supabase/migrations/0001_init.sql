create table if not exists fl_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  phase text not null default 'LOBBY',
  deck text not null default 'GENERAL',
  school_size smallint not null default 50,
  fish_left smallint not null default 50,
  write_seconds smallint not null default 60,
  host_player_id uuid,
  reader_player_id uuid,
  winner_player_id uuid,
  round_number integer not null default 0,
  round_phase text not null default 'IDLE',
  current_prompt_id text,
  round_started_at timestamp with time zone,
  last_notice jsonb,
  last_round jsonb,
  used_prompts text[] not null default '{}',
  event_sequence integer not null default 0,
  created_at timestamp with time zone not null default now(),
  started_at timestamp with time zone,
  finished_at timestamp with time zone
);

create table if not exists fl_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references fl_rooms (id) on delete cascade,
  name text not null,
  seat smallint not null,
  is_host boolean not null default false,
  fish smallint not null default 0,
  joined_at timestamp with time zone not null default now()
);

create unique index if not exists fl_players_seat_idx on fl_players (room_id, seat);
create unique index if not exists fl_players_name_idx on fl_players (room_id, lower(btrim(name)));

create table if not exists fl_player_secrets (
  player_id uuid primary key references fl_players (id) on delete cascade,
  room_id uuid not null references fl_rooms (id) on delete cascade,
  access_token text not null unique
);

create table if not exists fl_answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references fl_rooms (id) on delete cascade,
  round_number integer not null,
  player_id uuid not null references fl_players (id) on delete cascade,
  body text not null,
  normalized text not null,
  group_key text not null,
  submitted_at timestamp with time zone not null default now()
);

create unique index if not exists fl_answers_once_idx on fl_answers (room_id, round_number, player_id);
create index if not exists fl_answers_round_idx on fl_answers (room_id, round_number);

create table if not exists fl_events (
  id bigserial primary key,
  room_id uuid not null references fl_rooms (id) on delete cascade,
  sequence integer not null,
  type text not null,
  actor_id uuid,
  detail text,
  created_at timestamp with time zone not null default now()
);

create index if not exists fl_events_room_idx on fl_events (room_id, sequence desc);

alter table fl_rooms add constraint fl_rooms_school_range check (school_size between 10 and 200);
alter table fl_rooms add constraint fl_rooms_fish_left_range check (fish_left >= 0);
alter table fl_players add constraint fl_players_fish_range check (fish >= 0);

alter table fl_rooms enable row level security;
alter table fl_players enable row level security;
alter table fl_player_secrets enable row level security;
alter table fl_answers enable row level security;
alter table fl_events enable row level security;

create or replace function fl_next_sequence(p_room uuid)
returns integer
language plpgsql
as $$
declare
  next_value integer;
begin
  update fl_rooms
  set event_sequence = event_sequence + 1
  where id = p_room
  returning event_sequence into next_value;

  return next_value;
end;
$$;
