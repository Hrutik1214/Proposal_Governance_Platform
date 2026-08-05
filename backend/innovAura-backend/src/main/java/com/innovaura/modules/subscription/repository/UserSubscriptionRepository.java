package com.innovaura.modules.subscription.repository;

import com.innovaura.modules.subscription.entity.UserSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Integer> {
    Optional<UserSubscription> findByUserIdAndStatus(Integer userId, String status);
    List<UserSubscription> findByUserIdOrderByStartDateDesc(Integer userId);
    Optional<UserSubscription> findByRazorpayOrderId(String razorpayOrderId);
}
