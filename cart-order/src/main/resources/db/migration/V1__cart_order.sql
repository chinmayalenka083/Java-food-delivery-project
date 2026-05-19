create table carts (
    id        bigint generated always as identity primary key,
    user_id   bigint not null,
    updated_at timestamp default current_timestamp
);

create table cart_items (
    id          bigint generated always as identity primary key,
    cart_id     bigint not null,
    food_id     bigint not null,
    food_name   varchar(150) not null,
    unit_price  float(53) not null,
    quantity    integer not null,
    constraint fk_cart_items_cart foreign key (cart_id) references carts(id) on delete cascade
);

create table orders (
    id             bigint generated always as identity primary key,
    user_id        bigint not null,
    address_id     bigint,
    total_price    float(53) not null,
    payment_status varchar(30) not null default 'PENDING',
    order_status   varchar(30) not null default 'CREATED',
    placed_at      timestamp default current_timestamp
);

create table order_items (
    id          bigint generated always as identity primary key,
    order_id    bigint not null,
    food_id     bigint not null,
    food_name   varchar(150) not null,
    unit_price  float(53) not null,
    quantity    integer not null,
    constraint fk_order_items_order foreign key (order_id) references orders(id) on delete cascade
);
