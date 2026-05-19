package com.foodbox.cartorder.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PaymentSignatureServiceTest {

    @Test
    void validates_signature() {
        PaymentSignatureService svc = new PaymentSignatureService("secret", 300);
        String payload = "{\"hello\":\"world\"}";
        long ts = System.currentTimeMillis() / 1000;
        String sig = svc.compute(ts, payload);
        assertTrue(svc.isValid(payload, sig, String.valueOf(ts)));
        assertFalse(svc.isValid(payload, "bad", String.valueOf(ts)));
    }
}
