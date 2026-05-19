package com.foodbox.cartorder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbox.cartorder.repo.OrderRepository;
import com.foodbox.cartorder.security.PaymentSignatureService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
class PaymentWebhookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentSignatureService signatureService;

    @Test
    void payment_webhook_invalid_order_returns_bad_request() throws Exception {
        Map<String, Object> payload = Map.of(
                "orderId", 999,
                "paymentStatus", "SUCCEEDED",
                "transactionId", "pay_txn_missing",
                "provider", "RAZORPAY"
        );
        String body = objectMapper.writeValueAsString(payload);
        long ts = System.currentTimeMillis() / 1000;
        mockMvc.perform(post("/webhooks/payments")
                        .header("X-Signature", signatureService.compute(ts, body))
                        .header("X-Signature-Timestamp", String.valueOf(ts))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void payment_webhook_succeeds_and_advances_status() throws Exception {
        // create an order directly
        com.foodbox.cartorder.model.Order order = new com.foodbox.cartorder.model.Order();
        order.setUserId(1L);
        order.setAddressId(1L);
        order.setTotalPrice(123.0);
        orderRepository.saveAndFlush(order);

        Map<String, Object> payload = Map.of(
                "orderId", order.getId(),
                "paymentStatus", "SUCCEEDED",
                "transactionId", "pay_txn_123",
                "provider", "RAZORPAY"
        );

        String body = objectMapper.writeValueAsString(payload);
        long ts = System.currentTimeMillis() / 1000;
        mockMvc.perform(post("/webhooks/payments")
                        .header("X-Signature", signatureService.compute(ts, body))
                        .header("X-Signature-Timestamp", String.valueOf(ts))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value("SUCCEEDED"))
                .andExpect(jsonPath("$.orderStatus").value("PREPARING"))
                .andExpect(jsonPath("$.paymentReference").value("pay_txn_123"));

        // second call with same txn should be idempotent success
        mockMvc.perform(post("/webhooks/payments")
                        .header("X-Signature", signatureService.compute(ts, body))
                        .header("X-Signature-Timestamp", String.valueOf(ts))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentReference").value("pay_txn_123"));

        // different txn id should fail
        Map<String, Object> payload2 = Map.of(
                "orderId", order.getId(),
                "paymentStatus", "SUCCEEDED",
                "transactionId", "pay_txn_999",
                "provider", "RAZORPAY"
        );
        String body2 = objectMapper.writeValueAsString(payload2);
        long ts2 = System.currentTimeMillis() / 1000;
        mockMvc.perform(post("/webhooks/payments")
                        .header("X-Signature", signatureService.compute(ts2, body2))
                        .header("X-Signature-Timestamp", String.valueOf(ts2))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body2))
                .andExpect(status().isBadRequest());
    }
}
