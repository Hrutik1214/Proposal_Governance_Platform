package com.innovaura.modules.subscription.service;

import com.innovaura.exception.NotFoundException;
import com.innovaura.modules.auth.entity.User;
import com.innovaura.modules.auth.repository.UserRepository;
import com.innovaura.modules.subscription.dto.*;
import com.innovaura.modules.subscription.entity.Subscription;
import com.innovaura.modules.subscription.entity.UserSubscription;
import com.innovaura.modules.subscription.repository.SubscriptionRepository;
import com.innovaura.modules.subscription.repository.UserSubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private UserSubscriptionRepository userSubscriptionRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<SubscriptionPlanResponse> getPlansByRole(String role) {
        List<Subscription> plans = subscriptionRepository.findByTargetRoleAndActiveTrue(role);

        if (plans.isEmpty()) {
            // Provide default fallback plans if none in database yet
            return getDefaultPlans(role);
        }

        return plans.stream()
                .map(this::toPlanResponse)
                .collect(Collectors.toList());
    }

    private List<SubscriptionPlanResponse> getDefaultPlans(String role) {
        if ("Founder".equalsIgnoreCase(role)) {
            return Arrays.asList(
                    SubscriptionPlanResponse.builder()
                            .id(1)
                            .name("Starter Founder")
                            .description("Basic proposal submission, community peer reviews, and standard platform access.")
                            .price(BigDecimal.ZERO)
                            .targetRole("Founder")
                            .active(true)
                            .build(),
                    SubscriptionPlanResponse.builder()
                            .id(2)
                            .name("Premium Founder")
                            .description("Unlimited proposal submissions, priority Gemini AI analysis, verified founder badge, and direct investor messaging.")
                            .price(new BigDecimal("20.00"))
                            .targetRole("Founder")
                            .active(true)
                            .build()
            );
        }
        return Arrays.asList(
                SubscriptionPlanResponse.builder()
                        .id(3)
                        .name("Starter Investor")
                        .description("Browse marketplace proposals, view basic startup metrics, and express investment interest.")
                        .price(BigDecimal.ZERO)
                        .targetRole("Investor")
                        .active(true)
                        .build(),
                SubscriptionPlanResponse.builder()
                        .id(4)
                        .name("Premium Investor")
                        .description("Full pitch deck downloads, priority due diligence reports, direct founder consultation, and real-time deal alerts.")
                        .price(new BigDecimal("20.00"))
                        .targetRole("Investor")
                        .active(true)
                        .build()
        );
    }

    @Transactional(readOnly = true)
    public MySubscriptionResponse getMySubscription(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Optional<UserSubscription> activeSub = userSubscriptionRepository.findByUserIdAndStatus(user.getId(), "Active");

        if (activeSub.isPresent()) {
            UserSubscription sub = activeSub.get();
            return MySubscriptionResponse.builder()
                    .hasActive(true)
                    .data(MySubscriptionResponse.UserSubscriptionData.builder()
                            .id(sub.getId())
                            .subscriptionId(sub.getSubscription().getId())
                            .status(sub.getStatus())
                            .startDate(sub.getStartDate())
                            .endDate(sub.getEndDate())
                            .subscription(toPlanResponse(sub.getSubscription()))
                            .build())
                    .build();
        }

        return MySubscriptionResponse.builder()
                .hasActive(false)
                .data(null)
                .build();
    }

    @Transactional
    public BuySubscriptionResponse buySubscription(String username, BuySubscriptionRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Subscription subscription = subscriptionRepository.findById(request.getSubscriptionId())
                .orElseGet(() -> {
                    // Create in DB if default plan ID requested
                    List<SubscriptionPlanResponse> defaults = getDefaultPlans(request.getRole());
                    SubscriptionPlanResponse match = defaults.stream()
                            .filter(p -> p.getId().equals(request.getSubscriptionId()))
                            .findFirst()
                            .orElse(defaults.get(defaults.size() - 1));

                    Subscription newSub = Subscription.builder()
                            .name(match.getName())
                            .description(match.getDescription())
                            .price(match.getPrice())
                            .targetRole(request.getRole() != null ? request.getRole() : user.getRole())
                            .active(true)
                            .build();
                    return subscriptionRepository.save(newSub);
                });

        boolean isFree = subscription.getPrice().compareTo(BigDecimal.ZERO) == 0;

        if (isFree) {
            // Activate free subscription
            userSubscriptionRepository.findByUserIdAndStatus(user.getId(), "Active")
                    .ifPresent(old -> {
                        old.setStatus("Deactivated");
                        userSubscriptionRepository.save(old);
                    });

            UserSubscription newSub = UserSubscription.builder()
                    .user(user)
                    .subscription(subscription)
                    .status("Active")
                    .startDate(LocalDateTime.now())
                    .endDate(LocalDateTime.now().plusYears(1))
                    .build();
            userSubscriptionRepository.save(newSub);

            return BuySubscriptionResponse.builder()
                    .success(true)
                    .message("Free plan activated successfully.")
                    .isFree(true)
                    .build();
        }

        // Razorpay order simulation
        String orderId = "order_sim_" + UUID.randomUUID().toString().substring(0, 10);
        int amountInPaise = subscription.getPrice().multiply(new BigDecimal("100")).intValue();

        return BuySubscriptionResponse.builder()
                .success(true)
                .message("Order created successfully.")
                .isFree(false)
                .orderId(orderId)
                .amountInPaise(amountInPaise)
                .currency("INR")
                .keyId("rzp_test_key_placeholder")
                .planName(subscription.getName())
                .paymentType("Subscription")
                .build();
    }

    @Transactional
    public PaymentVerifyResponse verifyPayment(String username, PaymentVerifyRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Subscription subscription = subscriptionRepository.findById(request.getSubscriptionId())
                .orElseGet(() -> {
                    List<SubscriptionPlanResponse> defaults = getDefaultPlans(request.getRole());
                    SubscriptionPlanResponse match = defaults.stream()
                            .filter(p -> p.getId().equals(request.getSubscriptionId()))
                            .findFirst()
                            .orElse(defaults.get(1));

                    Subscription newSub = Subscription.builder()
                            .name(match.getName())
                            .description(match.getDescription())
                            .price(match.getPrice())
                            .targetRole(request.getRole() != null ? request.getRole() : user.getRole())
                            .active(true)
                            .build();
                    return subscriptionRepository.save(newSub);
                });

        // Deactivate old active subscription
        userSubscriptionRepository.findByUserIdAndStatus(user.getId(), "Active")
                .ifPresent(old -> {
                    old.setStatus("Deactivated");
                    userSubscriptionRepository.save(old);
                });

        UserSubscription newSub = UserSubscription.builder()
                .user(user)
                .subscription(subscription)
                .status("Active")
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusMonths(1))
                .razorpayOrderId(request.getOrderId())
                .razorpayPaymentId(request.getPaymentId())
                .build();
        userSubscriptionRepository.save(newSub);

        return PaymentVerifyResponse.builder()
                .success(true)
                .message("Payment verified and Premium Subscription activated!")
                .build();
    }

    @Transactional
    public Map<String, Object> cancelSubscription(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Optional<UserSubscription> activeSub = userSubscriptionRepository.findByUserIdAndStatus(user.getId(), "Active");

        if (activeSub.isPresent()) {
            UserSubscription sub = activeSub.get();
            sub.setStatus("Deactivated");
            sub.setEndDate(LocalDateTime.now());
            userSubscriptionRepository.save(sub);

            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", "Subscription plan deactivated successfully.");
            return res;
        }

        Map<String, Object> res = new HashMap<>();
        res.put("success", false);
        res.put("message", "No active subscription found to cancel.");
        return res;
    }

    private SubscriptionPlanResponse toPlanResponse(Subscription sub) {
        return SubscriptionPlanResponse.builder()
                .id(sub.getId())
                .name(sub.getName())
                .description(sub.getDescription())
                .price(sub.getPrice())
                .targetRole(sub.getTargetRole())
                .active(sub.getActive())
                .build();
    }
}
