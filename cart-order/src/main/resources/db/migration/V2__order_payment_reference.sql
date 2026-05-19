alter table orders add column if not exists payment_reference varchar(100);
alter table orders add column if not exists payment_provider varchar(30);
alter table orders add column if not exists version bigint default 0 not null;
alter table carts add column if not exists version bigint default 0 not null;
