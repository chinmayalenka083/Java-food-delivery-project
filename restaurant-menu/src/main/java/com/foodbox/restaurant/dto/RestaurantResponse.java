package com.foodbox.restaurant.dto;

import java.math.BigDecimal;

public class RestaurantResponse {
    private Long id;
    private String name;
    private String cuisine;
    private String location;
    private BigDecimal rating;
    private long reviewCount;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCuisine() {
        return cuisine;
    }

    public void setCuisine(String cuisine) {
        this.cuisine = cuisine;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal  rating) {
        this.rating = rating;
    }

    public long getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(long reviewCount) {
        this.reviewCount = reviewCount;
    }
}
