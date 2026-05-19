package com.foodbox.cartorder.service;

import com.foodbox.cartorder.model.OrderStatus;
import com.foodbox.cartorder.repo.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@Import(OrderService.class)
@ActiveProfiles("test")
class OrderStatusTransitionTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void invalid_transition_from_created_to_delivered() {
        var order = new com.foodbox.cartorder.model.Order();
        order.setUserId(1L);
        order.setAddressId(1L);
        order.setTotalPrice(100.0);
        orderRepository.save(order);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> orderService.updateStatus(1L, order.getId(), OrderStatus.DELIVERED.name(), false));
        assertEquals("Invalid status transition", ex.getMessage());
    }
}
