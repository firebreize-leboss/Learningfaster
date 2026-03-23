alter table public.profiles
  add column if not exists credits integer not null default 10;

alter table public.profiles
  add constraint profiles_credits_non_negative check (credits >= 0);

alter table public.exercise_sessions
  add column if not exists pdf_document_id uuid references public.pdf_documents(id) on delete cascade,
  add column if not exists chapter text,
  add column if not exists generated_content jsonb;

alter table public.summary_sheets
  add column if not exists pdf_document_id uuid references public.pdf_documents(id) on delete cascade,
  add column if not exists chapter text;

create or replace function public.consume_credits(p_user_id uuid, p_cost integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining integer;
begin
  if p_cost <= 0 then
    return (select credits from public.profiles where id = p_user_id);
  end if;

  update public.profiles
  set credits = credits - p_cost
  where id = p_user_id
    and credits >= p_cost
  returning credits into remaining;

  if remaining is null then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  return remaining;
end;
$$;
