package com.foodbox.subscription.controller;

import com.foodbox.subscription.dto.SubscriptionRequest;
import com.foodbox.subscription.dto.SubscriptionResponse;
import com.foodbox.subscription.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subscriptions")
public class SubscriptionController {
    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping
    public ResponseEntity<SubscriptionResponse> subscribe(@RequestHeader("X-USER-ID") Long userId,
                                                          @Valid @RequestBody SubscriptionRequest request) {
        return ResponseEntity.status(201).body(subscriptionService.subscribe(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionResponse>> list(@RequestHeader("X-USER-ID") Long userId) {
        return ResponseEntity.ok(subscriptionService.list(userId));
    }
}
