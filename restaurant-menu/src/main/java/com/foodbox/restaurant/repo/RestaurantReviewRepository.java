package com.foodbox.restaurant.repo;

import com.foodbox.restaurant.model.RestaurantReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RestaurantReviewRepository extends JpaRepository<RestaurantReview, Long> {

    List<RestaurantReview> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
}
