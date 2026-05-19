package com.foodbox.cartorder.controller;

import com.foodbox.cartorder.dto.CartItemRequest;
import com.foodbox.cartorder.dto.CartResponse;
import com.foodbox.cartorder.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;
    private final com.foodbox.cartorder.security.AuthUser authUser;

    public CartController(CartService cartService, com.foodbox.cartorder.security.AuthUser authUser) {
        this.cartService = cartService;
        this.authUser = authUser;
    }

    @PostMapping("/add")
    public ResponseEntity<CartResponse> add(@Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.status(201).body(cartService.addItem(authUser.currentUserId(), request));
    }

    @GetMapping
    public ResponseEntity<CartResponse> get() {
        return ResponseEntity.ok(cartService.getCart(authUser.currentUserId()));
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<CartResponse> remove(@PathVariable("itemId") Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(authUser.currentUserId(), itemId));
    }
}
