create table meal_subscriptions (
    id              bigint generated always as identity primary key,
    user_id         bigint not null,
    package_id      varchar(80) not null,
    package_name    varchar(150) not null,
    monthly_price   numeric(10,2) not null,
    included_items  varchar(1000) not null,
    status          varchar(30) not null default 'ACTIVE',
    subscribed_at   timestamp default current_timestamp
);
