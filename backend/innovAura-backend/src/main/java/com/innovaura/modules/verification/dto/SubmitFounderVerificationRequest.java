package com.innovaura.modules.verification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitFounderVerificationRequest {

    private String verificationLevel; // "Basic", "Verified", "Business"
    private String panNumber;
    private String aadhaarNumber;
    private String linkedInUrl;
    private String gstNumber;
    private String registrationNumber;
    private String cinNumber;
    private String documentUrl;
    private String notes;
}
