package com.innovaura.modules.subscription.controller;

import com.innovaura.modules.subscription.dto.PaymentOtpResponse;
import com.innovaura.modules.subscription.dto.PaymentVerifyRequest;
import com.innovaura.modules.subscription.dto.PaymentVerifyResponse;
import com.innovaura.modules.subscription.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private SubscriptionService subscriptionService;

    @PostMapping("/send-otp")
    public ResponseEntity<PaymentOtpResponse> sendPaymentOtp(Authentication authentication) {
        return ResponseEntity.ok(subscriptionService.sendPaymentOtp(authentication.getName()));
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentVerifyResponse> verifyPayment(Authentication authentication, @RequestBody PaymentVerifyRequest request) {
        return ResponseEntity.ok(subscriptionService.verifyPayment(authentication.getName(), request));
    }
}
