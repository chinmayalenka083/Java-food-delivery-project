package com.foodbox.subscription.service;

import com.foodbox.subscription.dto.SubscriptionRequest;
import com.foodbox.subscription.dto.SubscriptionResponse;
import com.foodbox.subscription.model.MealSubscription;
import com.foodbox.subscription.repository.MealSubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class SubscriptionService {
    private final MealSubscriptionRepository repository;

    public SubscriptionService(MealSubscriptionRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public SubscriptionResponse subscribe(Long userId, SubscriptionRequest request) {
        MealSubscription subscription = new MealSubscription();
        subscription.setUserId(userId);
        subscription.setPackageId(request.getPackageId());
        subscription.setPackageName(request.getPackageName());
        subscription.setMonthlyPrice(request.getMonthlyPrice());
        subscription.setIncludedItems(String.join("|", request.getIncludedItems()));
        return toResponse(repository.save(subscription));
    }

    public List<SubscriptionResponse> list(Long userId) {
        return repository.findByUserIdOrderBySubscribedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private SubscriptionResponse toResponse(MealSubscription subscription) {
        SubscriptionResponse response = new SubscriptionResponse();
        response.setId(subscription.getId());
        response.setPackageId(subscription.getPackageId());
        response.setPackageName(subscription.getPackageName());
        response.setMonthlyPrice(subscription.getMonthlyPrice());
        response.setIncludedItems(Arrays.asList(subscription.getIncludedItems().split("\\|")));
        response.setStatus(subscription.getStatus());
        response.setSubscribedAt(subscription.getSubscribedAt());
        return response;
    }
}
