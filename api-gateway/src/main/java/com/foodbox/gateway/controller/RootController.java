package com.foodbox.gateway.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, Object> home() {
        return Map.of(
                "service", "FoodBox API Gateway",
                "status", "running",
                "routes", List.of(
                        "/auth/**",
                        "/users/**",
                        "/restaurants/**",
                        "/foods/**",
                        "/cart/**",
                        "/orders/**",
                        "/subscriptions/**",
                        "/payments/**",
                        "/webhooks/payments/**",
                        "/notifications/**",
                        "/deliveries/**",
                        "/admin/**"));
    }
}
