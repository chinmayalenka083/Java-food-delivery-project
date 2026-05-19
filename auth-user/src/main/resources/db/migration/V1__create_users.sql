create table users (
    id              bigint generated always as identity primary key,
    name            varchar(100)        not null,
    email           varchar(255)        not null unique,
    password        varchar(255)        not null,
    phone           varchar(20),
    role            varchar(20)         not null,
    created_at      timestamp           default CURRENT_TIMESTAMP
);
