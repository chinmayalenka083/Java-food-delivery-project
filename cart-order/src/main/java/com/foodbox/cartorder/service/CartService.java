package com.foodbox.cartorder.service;

import com.foodbox.cartorder.dto.CartItemRequest;
import com.foodbox.cartorder.dto.CartItemResponse;
import com.foodbox.cartorder.dto.CartResponse;
import com.foodbox.cartorder.model.Cart;
import com.foodbox.cartorder.model.CartItem;
import com.foodbox.cartorder.repo.CartItemRepository;
import com.foodbox.cartorder.repo.CartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }

    @Transactional
    public CartResponse addItem(Long userId, CartItemRequest request) {
        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> createCart(userId));

        Optional<CartItem> existing = cart.getItems().stream()
                .filter(ci -> ci.getFoodId().equals(request.getFoodId()))
                .findFirst();

        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setFoodId(request.getFoodId());
            item.setFoodName(request.getFoodName());
            item.setUnitPrice(request.getUnitPrice());
            item.setQuantity(request.getQuantity());
            cart.getItems().add(item);
        }

        cart.setUpdatedAt(Instant.now());
        cartRepository.save(cart);
        return mapCart(cart);
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> createCart(userId));
        return mapCart(cart);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long itemId) {
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> new IllegalArgumentException("Cart not found"));
        cart.getItems().removeIf(ci -> ci.getId().equals(itemId));
        cart.setUpdatedAt(Instant.now());
        cartRepository.save(cart);
        return mapCart(cart);
    }

    private Cart createCart(Long userId) {
        Cart cart = new Cart();
        cart.setUserId(userId);
        return cartRepository.save(cart);
    }

    private CartResponse mapCart(Cart cart) {
        List<CartItemResponse> items = new ArrayList<>();
        double subTotal = 0;
        for (CartItem item : cart.getItems()) {
            CartItemResponse resp = new CartItemResponse();
            resp.setId(item.getId());
            resp.setFoodId(item.getFoodId());
            resp.setFoodName(item.getFoodName());
            resp.setQuantity(item.getQuantity());
            resp.setUnitPrice(item.getUnitPrice());
            double line = item.getUnitPrice() * item.getQuantity();
            resp.setLineTotal(line);
            subTotal += line;
            items.add(resp);
        }
        CartResponse cartResponse = new CartResponse();
        cartResponse.setCartId(cart.getId());
        cartResponse.setItems(items);
        cartResponse.setSubTotal(subTotal);
        return cartResponse;
    }
}
