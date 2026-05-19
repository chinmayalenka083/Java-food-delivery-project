package com.foodbox.cartorder.dto;

import jakarta.validation.constraints.NotBlank;

public class OrderStatusUpdateRequest {
    @NotBlank
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
