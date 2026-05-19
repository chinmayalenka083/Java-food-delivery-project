package com.foodbox.subscription.repository;

import com.foodbox.subscription.model.MealSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MealSubscriptionRepository extends JpaRepository<MealSubscription, Long> {
    List<MealSubscription> findByUserIdOrderBySubscribedAtDesc(Long userId);
}
