package com.foodbox.cartorder.service;

import com.foodbox.cartorder.dto.OrderItemResponse;
import com.foodbox.cartorder.dto.OrderResponse;
import com.foodbox.cartorder.dto.PlaceOrderRequest;
import com.foodbox.cartorder.model.*;
import com.foodbox.cartorder.repo.CartRepository;
import com.foodbox.cartorder.repo.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;

    public OrderService(CartRepository cartRepository, OrderRepository orderRepository) {
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public OrderResponse placeOrder(Long userId, PlaceOrderRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        Order order = new Order();
        order.setUserId(userId);
        order.setAddressId(request.getAddressId());

        double total = 0;
        for (CartItem cartItem : cart.getItems()) {
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setFoodId(cartItem.getFoodId());
            oi.setFoodName(cartItem.getFoodName());
            oi.setUnitPrice(cartItem.getUnitPrice());
            oi.setQuantity(cartItem.getQuantity());
            order.getItems().add(oi);
            total += cartItem.getUnitPrice() * cartItem.getQuantity();
        }
        order.setTotalPrice(total);

        Order saved = orderRepository.save(order);
        // Clear cart after placing order
        cart.getItems().clear();
        cartRepository.save(cart);

        return mapOrder(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> listOrders(Long userId) {
        return orderRepository.findByUserIdOrderByPlacedAtDesc(userId).stream()
                .map(this::mapOrder)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        return mapOrder(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long userId, Long orderId, String status, boolean adminOverride) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!adminOverride && !order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Order not found");
        }
        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid status");
        }
        if (!isAllowedTransition(order.getOrderStatus(), newStatus)) {
            throw new IllegalArgumentException("Invalid status transition");
        }
        order.setOrderStatus(newStatus);
        return mapOrder(order);
    }

    @Transactional
    public OrderResponse updatePaymentStatus(Long orderId, String paymentStatus, String transactionId, String provider) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        PaymentStatus newStatus;
        try {
            newStatus = PaymentStatus.valueOf(paymentStatus.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid payment status");
        }
        // Idempotency: if already succeeded with same reference, just return current state
        if (order.getPaymentStatus() == PaymentStatus.SUCCEEDED && newStatus == PaymentStatus.SUCCEEDED) {
            if (order.getPaymentReference() != null && order.getPaymentReference().equals(transactionId)) {
                return mapOrder(order);
            }
            throw new IllegalArgumentException("Payment already succeeded with different reference");
        }
        if (!isAllowedPaymentTransition(order.getPaymentStatus(), newStatus)) {
            throw new IllegalArgumentException("Invalid payment status transition");
        }
        order.setPaymentStatus(newStatus);
        if (newStatus == PaymentStatus.SUCCEEDED) {
            if (transactionId == null || transactionId.isBlank()) {
                throw new IllegalArgumentException("transactionId required for succeeded payments");
            }
            if (order.getPaymentReference() != null && !order.getPaymentReference().equals(transactionId)) {
                throw new IllegalArgumentException("Payment reference mismatch");
            }
            order.setPaymentReference(transactionId);
            order.setPaymentProvider(provider);
        }
        // auto-advance order status when payment succeeds
        if (newStatus == PaymentStatus.SUCCEEDED && order.getOrderStatus() == OrderStatus.CREATED) {
            order.setOrderStatus(OrderStatus.PREPARING);
        }
        return mapOrder(order);
    }

    private OrderResponse mapOrder(Order order) {
        List<OrderItemResponse> items = new ArrayList<>();
        double total = 0;
        for (OrderItem item : order.getItems()) {
            OrderItemResponse resp = new OrderItemResponse();
            resp.setId(item.getId());
            resp.setFoodId(item.getFoodId());
            resp.setFoodName(item.getFoodName());
            resp.setQuantity(item.getQuantity());
            resp.setUnitPrice(item.getUnitPrice());
            double line = item.getUnitPrice() * item.getQuantity();
            resp.setLineTotal(line);
            total += line;
            items.add(resp);
        }
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setAddressId(order.getAddressId());
        response.setOrderStatus(order.getOrderStatus().name());
        response.setPaymentStatus(order.getPaymentStatus().name());
        response.setPaymentReference(order.getPaymentReference());
        response.setPaymentProvider(order.getPaymentProvider());
        response.setPlacedAt(order.getPlacedAt());
        response.setItems(items);
        response.setTotalPrice(total);
        return response;
    }

    private boolean isAllowedTransition(OrderStatus from, OrderStatus to) {
        if (from == to) return true;
        return switch (from) {
            case CREATED -> to == OrderStatus.PREPARING || to == OrderStatus.CANCELLED;
            case PREPARING -> to == OrderStatus.OUT_FOR_DELIVERY || to == OrderStatus.CANCELLED;
            case OUT_FOR_DELIVERY -> to == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }

    private boolean isAllowedPaymentTransition(PaymentStatus from, PaymentStatus to) {
        if (from == to) return true;
        return switch (from) {
            case PENDING -> to == PaymentStatus.SUCCEEDED || to == PaymentStatus.FAILED;
            case SUCCEEDED, FAILED -> false;
        };
    }
}
