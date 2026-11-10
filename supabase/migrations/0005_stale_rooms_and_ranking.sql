alter table fl_matches
  add column if not exists closed_by text not null default 'target';

create index if not exists fl_rooms_started_idx on fl_rooms(phase, started_at);
