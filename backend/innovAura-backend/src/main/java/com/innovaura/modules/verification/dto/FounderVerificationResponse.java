package com.innovaura.modules.verification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FounderVerificationResponse {

    private Integer id;
    private Integer userId;
    private String verificationLevel;
    private Boolean emailVerified;
    private Boolean mobileVerified;
    private Boolean panVerified;
    private String panNumber;
    private Boolean aadhaarVerified;
    private String aadhaarNumber;
    private Boolean linkedInVerified;
    private String linkedInUrl;
    private Boolean gstVerified;
    private String gstNumber;
    private Boolean companyRegVerified;
    private String registrationNumber;
    private Boolean cinVerified;
    private String cinNumber;
    private String documentUrl;
    private String status;
    private Integer checkedById;
    private LocalDateTime checkedAt;
    private String notes;
}
