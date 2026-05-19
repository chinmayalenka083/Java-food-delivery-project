package com.foodbox.restaurant.service;

import com.foodbox.restaurant.dto.FoodResponse;
import com.foodbox.restaurant.dto.RestaurantResponse;
import com.foodbox.restaurant.dto.RestaurantReviewRequest;
import com.foodbox.restaurant.dto.RestaurantReviewResponse;
import com.foodbox.restaurant.model.FoodItem;
import com.foodbox.restaurant.model.Restaurant;
import com.foodbox.restaurant.model.RestaurantReview;
import com.foodbox.restaurant.repo.FoodItemRepository;
import com.foodbox.restaurant.repo.RestaurantRepository;
import com.foodbox.restaurant.repo.RestaurantReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuService {

    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;
    private final RestaurantReviewRepository restaurantReviewRepository;

    public MenuService(RestaurantRepository restaurantRepository,
                       FoodItemRepository foodItemRepository,
                       RestaurantReviewRepository restaurantReviewRepository) {
        this.restaurantRepository = restaurantRepository;
        this.foodItemRepository = foodItemRepository;
        this.restaurantReviewRepository = restaurantReviewRepository;
    }

    // 🔹 Get all restaurants
    @Transactional(readOnly = true)
    public List<RestaurantResponse> listRestaurants() {
        return restaurantRepository.findAll().stream()
                .map(this::mapRestaurant)
                .collect(Collectors.toList());
    }

    // 🔹 Get menu by restaurant
    @Transactional(readOnly = true)
    public List<FoodResponse> listMenuByRestaurant(Long restaurantId) {
        ensureRestaurantExists(restaurantId);

        return foodItemRepository
                .findByRestaurantIdAndAvailableTrue(restaurantId)
                .stream()
                .map(this::mapFood)
                .collect(Collectors.toList());
    }

    // 🔹 Get single food item
    @Transactional(readOnly = true)
    public FoodResponse getFood(Long id) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Food item not found"));

        return mapFood(item);
    }

    @Transactional(readOnly = true)
    public List<RestaurantReviewResponse> listReviewsByRestaurant(Long restaurantId) {
        ensureRestaurantExists(restaurantId);

        return restaurantReviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId).stream()
                .map(this::mapReview)
                .collect(Collectors.toList());
    }

    @Transactional
    public RestaurantReviewResponse addReview(Long restaurantId, RestaurantReviewRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));

        RestaurantReview review = new RestaurantReview();
        review.setRestaurant(restaurant);
        review.setReviewerName(request.getReviewerName().trim());
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());

        RestaurantReview savedReview = restaurantReviewRepository.save(review);
        restaurant.setRating(calculateAverageRating(restaurantId));

        return mapReview(savedReview);
    }

    // 🔹 Validation
    private void ensureRestaurantExists(Long id) {
        restaurantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));
    }

    // 🔹 Mapping: Entity → DTO
    private RestaurantResponse mapRestaurant(Restaurant restaurant) {
        RestaurantResponse resp = new RestaurantResponse();
        resp.setId(restaurant.getId());
        resp.setName(restaurant.getName());
        resp.setCuisine(restaurant.getCuisine());
        resp.setLocation(restaurant.getLocation());
        resp.setRating(restaurant.getRating());
        resp.setReviewCount(restaurantReviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurant.getId()).size());
        return resp;
    }

    private FoodResponse mapFood(FoodItem item) {
        FoodResponse resp = new FoodResponse();
        resp.setId(item.getId());
        resp.setRestaurantId(item.getRestaurant().getId());
        resp.setName(item.getName());
        resp.setPrice(item.getPrice());
        resp.setCategory(item.getCategory());
        resp.setVeg(item.getVeg());
        resp.setCalories(item.getCalories());
        return resp;
    }

    private RestaurantReviewResponse mapReview(RestaurantReview review) {
        RestaurantReviewResponse response = new RestaurantReviewResponse();
        response.setId(review.getId());
        response.setRestaurantId(review.getRestaurant().getId());
        response.setReviewerName(review.getReviewerName());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }

    private BigDecimal calculateAverageRating(Long restaurantId) {
        List<RestaurantReview> reviews = restaurantReviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
        if (reviews.isEmpty()) {
            return null;
        }

        BigDecimal total = reviews.stream()
                .map(review -> BigDecimal.valueOf(review.getRating()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return total.divide(BigDecimal.valueOf(reviews.size()), 1, RoundingMode.HALF_UP);
    }
}
