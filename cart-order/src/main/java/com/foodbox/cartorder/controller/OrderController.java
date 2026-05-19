package com.foodbox.cartorder.controller;

import com.foodbox.cartorder.dto.OrderResponse;
import com.foodbox.cartorder.dto.PlaceOrderRequest;
import com.foodbox.cartorder.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;
    private final com.foodbox.cartorder.security.AuthUser authUser;

    public OrderController(OrderService orderService, com.foodbox.cartorder.security.AuthUser authUser) {
        this.orderService = orderService;
        this.authUser = authUser;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody PlaceOrderRequest request) {
        return ResponseEntity.status(201).body(orderService.placeOrder(authUser.currentUserId(), request));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> list() {
        return ResponseEntity.ok(orderService.listOrders(authUser.currentUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrder(authUser.currentUserId(), id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id,
                                                      @Valid @RequestBody com.foodbox.cartorder.dto.OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(authUser.currentUserId(), id, request.getStatus(), false));
    }
}
