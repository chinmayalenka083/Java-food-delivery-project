
package com.foodbox.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-user", r -> r.path("/auth/**", "/users/**").uri("lb://auth-user"))
                .route("restaurant-menu", r -> r.path("/restaurants/**", "/foods/**").uri("lb://restaurant-menu"))
                .route("cart-order", r -> r.path("/cart/**", "/orders/**").uri("lb://cart-order"))
                // Payment provider webhooks are handled inside cart-order
                .route("payment-webhooks", r -> r.path("/webhooks/payments/**").uri("lb://cart-order"))
                .route("subscription", r -> r.path("/subscriptions/**").uri("lb://subscription"))
                .route("payment", r -> r.path("/payments/**").uri("lb://payment"))
                .route("notification", r -> r.path("/notifications/**").uri("lb://notification"))
                .route("delivery-partner", r -> r.path("/deliveries/**").uri("lb://delivery-partner"))
                // Admin order management lives in cart-order; keep analytics on its own service
                .route("admin-orders", r -> r.path("/admin/orders/**").uri("lb://cart-order"))
                .route("admin-analytics", r -> r.path("/admin/**").uri("lb://admin-analytics"))
                .build();
    }
}
