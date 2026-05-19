package com.foodbox.subscription.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class SubscriptionResponse {
    private Long id;
    private String packageId;
    private String packageName;
    private BigDecimal monthlyPrice;
    private List<String> includedItems;
    private String status;
    private Instant subscribedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPackageId() {
        return packageId;
    }

    public void setPackageId(String packageId) {
        this.packageId = packageId;
    }

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public BigDecimal getMonthlyPrice() {
        return monthlyPrice;
    }

    public void setMonthlyPrice(BigDecimal monthlyPrice) {
        this.monthlyPrice = monthlyPrice;
    }

    public List<String> getIncludedItems() {
        return includedItems;
    }

    public void setIncludedItems(List<String> includedItems) {
        this.includedItems = includedItems;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getSubscribedAt() {
        return subscribedAt;
    }

    public void setSubscribedAt(Instant subscribedAt) {
        this.subscribedAt = subscribedAt;
    }
}
