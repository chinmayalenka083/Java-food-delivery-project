package com.foodbox.cartorder.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class PaymentSignatureService {

    private final byte[] secret;
    private final long toleranceSeconds;

    public PaymentSignatureService(
            @Value("${payment.webhook.secret:change-me}") String secret,
            @Value("${payment.webhook.tolerance-seconds:300}") long toleranceSeconds) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.toleranceSeconds = toleranceSeconds;
    }

    public boolean isValid(String payload, String providedSignature, String timestampHeader) {
        if (providedSignature == null || providedSignature.isBlank()) return false;
        if (timestampHeader == null || timestampHeader.isBlank()) return false;
        long ts;
        try {
            ts = Long.parseLong(timestampHeader);
        } catch (NumberFormatException ex) {
            return false;
        }
        // Accept provider timestamps in milliseconds by normalizing to seconds
        long tsSeconds = ts > 1_000_000_000_000L ? ts / 1000 : ts;
        long nowSec = System.currentTimeMillis() / 1000;
        if (Math.abs(nowSec - tsSeconds) > toleranceSeconds) {
            return false;
        }
        String computed = compute(tsSeconds, payload);
        return constantTimeEquals(computed, providedSignature);
    }

    public String compute(long timestampSeconds, String payload) {
        String body = timestampSeconds + "." + payload;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            byte[] raw = mac.doFinal(body.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(raw);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to compute signature", e);
        }
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
