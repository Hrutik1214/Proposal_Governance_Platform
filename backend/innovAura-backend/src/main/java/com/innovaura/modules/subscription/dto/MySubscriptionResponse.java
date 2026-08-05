package com.innovaura.modules.subscription.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MySubscriptionResponse {
    private Boolean hasActive;
    private UserSubscriptionData data;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSubscriptionData {
        private Integer id;
        private Integer subscriptionId;
        private String status;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private SubscriptionPlanResponse subscription;
    }
}
