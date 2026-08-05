package com.innovaura.modules.subscription.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuySubscriptionRequest {
    private Integer subscriptionId;
    private String role;
}
