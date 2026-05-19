package com.foodbox.cartorder.dto;

import jakarta.validation.constraints.NotNull;

public class PlaceOrderRequest {
    @NotNull
    private Long addressId;

    public Long getAddressId() {
        return addressId;
    }

    public void setAddressId(Long addressId) {
        this.addressId = addressId;
    }
}
