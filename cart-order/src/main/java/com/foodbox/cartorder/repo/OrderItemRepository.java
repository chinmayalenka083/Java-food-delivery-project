package com.foodbox.cartorder.repo;

import com.foodbox.cartorder.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
