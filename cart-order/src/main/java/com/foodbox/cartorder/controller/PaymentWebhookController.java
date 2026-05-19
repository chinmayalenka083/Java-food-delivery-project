package com.foodbox.cartorder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbox.cartorder.dto.OrderResponse;
import com.foodbox.cartorder.dto.PaymentWebhookRequest;
import com.foodbox.cartorder.security.PaymentSignatureService;
import com.foodbox.cartorder.service.OrderService;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import jakarta.validation.ConstraintViolation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/webhooks/payments")
public class PaymentWebhookController {

    private final OrderService orderService;
    private final PaymentSignatureService signatureService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    public PaymentWebhookController(OrderService orderService,
                                    PaymentSignatureService signatureService,
                                    ObjectMapper objectMapper,
                                    Validator validator) {
        this.orderService = orderService;
        this.signatureService = signatureService;
        this.objectMapper = objectMapper;
        this.validator = validator;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> handlePayment(@RequestBody String raw,
                                                       @RequestHeader(name = "X-Signature", required = false) String signature,
                                                       @RequestHeader(name = "X-Signature-Timestamp", required = false) String tsHeader)
            throws Exception {
        if (!signatureService.isValid(raw, signature, tsHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        PaymentWebhookRequest request = objectMapper.readValue(raw, PaymentWebhookRequest.class);
        validate(request);
        return ResponseEntity.ok(orderService.updatePaymentStatus(
                request.getOrderId(),
                request.getPaymentStatus(),
                request.getTransactionId(),
                request.getProvider()));
    }

    private void validate(@Valid PaymentWebhookRequest request) {
        Set<ConstraintViolation<PaymentWebhookRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            String message = violations.iterator().next().getMessage();
            throw new IllegalArgumentException(message);
        }
    }
}
