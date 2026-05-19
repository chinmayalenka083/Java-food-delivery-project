create table restaurant_reviews (
    id              bigint generated always as identity primary key,
    restaurant_id   bigint not null,
    reviewer_name   varchar(120) not null,
    rating          integer not null,
    comment         varchar(500) not null,
    created_at      timestamp with time zone not null default current_timestamp,
    constraint fk_review_restaurant foreign key (restaurant_id) references restaurants(id) on delete cascade,
    constraint chk_review_rating check (rating between 1 and 5)
);

insert into restaurant_reviews (restaurant_id, reviewer_name, rating, comment) values
(1, 'Aarav', 5, 'Reliable packaging and very good taste.'),
(1, 'Mira', 4, 'Fast delivery and menu quality was consistent.'),
(2, 'Ishita', 4, 'Healthy options with dependable delivery times.');

update restaurants
set rating = ratings.avg_rating
from (
    select restaurant_id, round(avg(rating)::numeric, 1) as avg_rating
    from restaurant_reviews
    group by restaurant_id
) ratings
where restaurants.id = ratings.restaurant_id;
