package com.innovaura.modules.subscription.repository;

import com.innovaura.modules.subscription.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Integer> {
    List<Subscription> findByTargetRoleAndActiveTrue(String targetRole);
    List<Subscription> findByActiveTrue();
}
