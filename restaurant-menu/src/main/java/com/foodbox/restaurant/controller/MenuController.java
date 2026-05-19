package com.foodbox.restaurant.controller;

import com.foodbox.restaurant.dto.FoodResponse;
import com.foodbox.restaurant.dto.RestaurantResponse;
import com.foodbox.restaurant.dto.RestaurantReviewRequest;
import com.foodbox.restaurant.dto.RestaurantReviewResponse;
import com.foodbox.restaurant.service.MenuService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping("/restaurants")
    public ResponseEntity<List<RestaurantResponse>> restaurants() {
        return ResponseEntity.ok(menuService.listRestaurants());
    }

    @GetMapping("/restaurants/{id}/menu")
    public ResponseEntity<List<FoodResponse>> menu(@PathVariable("id") Long id) {
        return ResponseEntity.ok(menuService.listMenuByRestaurant(id));
    }

    @GetMapping("/restaurants/{id}/reviews")
    public ResponseEntity<List<RestaurantReviewResponse>> reviews(@PathVariable("id") Long id) {
        return ResponseEntity.ok(menuService.listReviewsByRestaurant(id));
    }

    @PostMapping("/restaurants/{id}/reviews")
    public ResponseEntity<RestaurantReviewResponse> addReview(@PathVariable("id") Long id,
                                                              @Valid @RequestBody RestaurantReviewRequest request) {
        return ResponseEntity.ok(menuService.addReview(id, request));
    }

    @GetMapping("/foods/{id}")
    public ResponseEntity<FoodResponse> food(@PathVariable("id") Long id) {
        return ResponseEntity.ok(menuService.getFood(id));
    }
}
