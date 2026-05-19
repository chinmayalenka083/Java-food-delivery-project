package com.foodbox.restaurant.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "restaurants")
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 100)
    private String cuisine;

    @Column(length = 150)
    private String location;

    @Column(precision = 2, scale = 1)
    private BigDecimal rating;

    @Column(length = 30, nullable = false)
    private String status = "ACTIVE";

    // ✅ Getter & Setter

    public Long getId() {
        return id;
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

    public BigDecimal getRating() {   // ✅ FIXED
        return rating;
    }

    public void setRating(BigDecimal rating) {   // ✅ FIXED
        this.rating = rating;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}