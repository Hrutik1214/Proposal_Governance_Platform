package com.innovaura.modules.subscription.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentVerifyRequest {
    private String orderId;
    private String paymentId;
    private String signature;
    private String paymentType;
    private Integer subscriptionId;
    private String role;
    private String otp;
}
