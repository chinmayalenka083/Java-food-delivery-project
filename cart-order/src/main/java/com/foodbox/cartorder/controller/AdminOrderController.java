package com.foodbox.cartorder.controller;

import com.foodbox.cartorder.dto.OrderResponse;
import com.foodbox.cartorder.dto.OrderStatusUpdateRequest;
import com.foodbox.cartorder.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id,
                                                      @Valid @RequestBody OrderStatusUpdateRequest request) {
        // Admin override: true (in future, secure via role)
        return ResponseEntity.ok(orderService.updateStatus(null, id, request.getStatus(), true));
    }
}
