package com.innovaura.modules.subscription.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentOtpResponse {
    private Boolean success;
    private String message;
    private String emailMasked;
    private String otp;
}
