package com.innovaura.modules.subscription.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuySubscriptionResponse {
    private Boolean success;
    private String message;
    private Boolean isFree;
    private String orderId;
    private Integer amountInPaise;
    private String currency;
    private String keyId;
    private String planName;
    private String paymentType;
}
