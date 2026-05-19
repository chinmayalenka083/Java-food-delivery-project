package com.foodbox.restaurant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbox.restaurant.model.Restaurant;
import com.foodbox.restaurant.repo.RestaurantRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MenuControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Test
    void contextLoads() {
        // Test that the application context loads successfully with Java 21
        // This verifies Java 21 compatibility without external dependencies
    }

    @Test
    void restaurantsEndpointAccessible() throws Exception {
        // Test that the restaurants endpoint returns a valid response
        // Returns 200 even if data is empty
        mockMvc.perform(get("/restaurants"))
                .andExpect(status().isOk());
    }

    @Test
    void canCreateReviewAndSeeItInReviewsEndpoint() throws Exception {
        Restaurant restaurant = new Restaurant();
        restaurant.setName("Review House");
        restaurant.setCuisine("Fusion");
        restaurant.setLocation("Pune");
        restaurant.setStatus("ACTIVE");
        restaurant.setRating(BigDecimal.valueOf(4.0));
        Restaurant saved = restaurantRepository.save(restaurant);

        Map<String, Object> payload = Map.of(
                "reviewerName", "Chinmay",
                "rating", 5,
                "comment", "Fast delivery and better packaging than before."
        );

        mockMvc.perform(post("/restaurants/{id}/reviews", saved.getId())
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reviewerName").value("Chinmay"))
                .andExpect(jsonPath("$.rating").value(5));

        mockMvc.perform(get("/restaurants/{id}/reviews", saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].comment").value("Fast delivery and better packaging than before."));
    }

    @Test
    void restaurantListingReflectsAggregatedReviewRating() throws Exception {
        Restaurant restaurant = new Restaurant();
        restaurant.setName("Rating Lab");
        restaurant.setCuisine("Indian");
        restaurant.setLocation("Delhi");
        restaurant.setStatus("ACTIVE");
        Restaurant saved = restaurantRepository.save(restaurant);

        mockMvc.perform(post("/restaurants/{id}/reviews", saved.getId())
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(Map.of(
                                "reviewerName", "Asha",
                                "rating", 5,
                                "comment", "Excellent food."
                        ))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/restaurants/{id}/reviews", saved.getId())
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(Map.of(
                                "reviewerName", "Vikram",
                                "rating", 4,
                                "comment", "Good quality and delivery time."
                        ))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/restaurants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.name=='Rating Lab')].reviewCount").value(org.hamcrest.Matchers.hasItem(2)))
                .andExpect(jsonPath("$[?(@.name=='Rating Lab')].rating").value(org.hamcrest.Matchers.hasItem(4.5)));
    }
}
