create table addresses (
    id           bigint generated always as identity primary key,
    user_id      bigint      not null,
    line1        varchar(150) not null,
    line2        varchar(150),
    city         varchar(80)  not null,
    state        varchar(80),
    postal_code  varchar(20),
    country      varchar(80),
    label        varchar(40),
    is_default   boolean      not null default false,
    latitude     double precision,
    longitude    double precision,
    constraint fk_addresses_user foreign key (user_id) references users(id) on delete cascade
);
