alter table fl_rooms alter column write_seconds set default 60;
update fl_rooms set write_seconds = 60 where write_seconds = 90 and phase <> 'FINISHED';
