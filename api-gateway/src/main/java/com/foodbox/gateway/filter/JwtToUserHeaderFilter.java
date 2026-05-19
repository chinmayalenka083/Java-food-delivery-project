package com.foodbox.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtToUserHeaderFilter implements GlobalFilter, Ordered {

    private final SecretKey secretKey;

    public JwtToUserHeaderFilter(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(secretKey)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
                Object uid = claims.get("uid");
                Object role = claims.get("role");
                if (uid != null) {
                    exchange = exchange.mutate()
                            .request(builder -> {
                                builder.header("X-USER-ID", uid.toString());
                                if (role != null) {
                                    builder.header("X-USER-ROLE", role.toString());
                                }
                            })
                            .build();
                }
            } catch (Exception ignored) {
                // If token invalid, proceed without injecting header; downstream will reject unauthenticated requests.
            }
        }
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -10; // run early
    }
}
