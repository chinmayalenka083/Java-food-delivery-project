create table restaurants (
    id            bigint generated always as identity primary key,
    name          varchar(150) not null,
    cuisine       varchar(100),
    location      varchar(150),
    rating        numeric(2,1),
    status        varchar(30) not null default 'ACTIVE'
);

create table food_items (
    id              bigint generated always as identity primary key,
    restaurant_id   bigint not null,
    name            varchar(150) not null,
    price           numeric(10,2) not null,
    category        varchar(100),
    veg             boolean not null default true,
    calories        integer,
    is_available    boolean not null default true,
    constraint fk_food_restaurant foreign key (restaurant_id) references restaurants(id) on delete cascade
);

insert into restaurants (name, cuisine, location, rating, status) values
('Spice Route', 'Indian', 'Bangalore', 4.5, 'ACTIVE'),
('Green Leaf', 'Vegan', 'Mumbai', 4.2, 'ACTIVE');

insert into food_items (restaurant_id, name, price, category, veg, calories, is_available) values
(1, 'Paneer Tikka', 250.00, 'Starters', true, 320, true),
(1, 'Butter Chicken', 320.00, 'Main Course', false, 520, true),
(2, 'Quinoa Salad', 220.00, 'Salads', true, 280, true),
(2, 'Vegan Bowl', 260.00, 'Bowls', true, 350, true);
