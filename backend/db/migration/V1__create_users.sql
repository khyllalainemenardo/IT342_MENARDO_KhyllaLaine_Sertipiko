create table if not exists public.users (
    user_id       bigint generated always as identity primary key,
    email         varchar(254) not null,
    password_hash varchar(100) not null,
    full_name     varchar(100) not null,
    role          varchar(20)  not null default 'PARTICIPANT',
    user_type     varchar(20),
    department    varchar(120),
    qr_token      varchar(64)  not null,
    status        varchar(20)  not null default 'ACTIVE',
    created_at    timestamptz  not null default now(),
    constraint uk_users_email unique (email),
    constraint uk_users_qr_token unique (qr_token),
    constraint ck_users_email_lowercase check (email = lower(email)),
    constraint ck_users_role check (role in ('PARTICIPANT', 'ORGANIZER', 'ADMIN')),
    constraint ck_users_user_type check (user_type is null or user_type in ('STUDENT', 'FACULTY', 'STAFF')),
    constraint ck_users_status check (status in ('ACTIVE', 'DISABLED'))
);

create index if not exists idx_users_role on public.users (role);

alter table public.users enable row level security;
revoke all on table public.users from anon, authenticated;
