alter table public.users
    add column if not exists password_changed_at timestamptz;

create table if not exists public.password_reset_tokens (
    token_id   bigint generated always as identity primary key,
    user_id    bigint      not null references public.users (user_id) on delete cascade,
    token_hash varchar(64) not null,
    expires_at timestamptz not null,
    used_at    timestamptz,
    created_at timestamptz not null default now(),
    constraint uk_password_reset_tokens_hash unique (token_hash)
);

create index if not exists idx_password_reset_tokens_user on public.password_reset_tokens (user_id);

alter table public.password_reset_tokens enable row level security;
revoke all on table public.password_reset_tokens from anon, authenticated;
