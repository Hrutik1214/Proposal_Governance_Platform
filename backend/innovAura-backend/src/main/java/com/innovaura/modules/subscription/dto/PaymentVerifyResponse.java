package com.innovaura.modules.subscription.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentVerifyResponse {
    private Boolean success;
    private String message;
}
