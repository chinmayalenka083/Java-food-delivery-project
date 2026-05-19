package com.foodbox.subscription.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "meal_subscriptions")
public class MealSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 80)
    private String packageId;

    @Column(nullable = false, length = 150)
    private String packageName;

    @Column(nullable = false)
    private BigDecimal monthlyPrice;

    @Column(nullable = false, length = 1000)
    private String includedItems;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    private Instant subscribedAt = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public String getIncludedItems() {
        return includedItems;
    }

    public void setIncludedItems(String includedItems) {
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
