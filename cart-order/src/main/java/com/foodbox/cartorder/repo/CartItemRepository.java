package com.foodbox.cartorder.repo;

import com.foodbox.cartorder.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
