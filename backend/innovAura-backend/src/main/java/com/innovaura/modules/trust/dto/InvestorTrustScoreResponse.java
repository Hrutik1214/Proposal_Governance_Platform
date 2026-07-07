package com.innovaura.modules.trust.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestorTrustScoreResponse {

    private Integer userId;
    private String investorName;
    private int trustScore;
    private String trustLevel;
    private LocalDateTime lastUpdated;

    private boolean identityVerified;
    private boolean panVerified;
    private boolean aadhaarVerified;
    private boolean organizationVerified;

    private int totalInvestments;
    private BigDecimal totalAmountInvested;
    private int activeInvestments;
    private int completedInvestments;
    private double founderRating;
    private double investmentSuccessRate;
    private int commitmentReliability;
    private int profileCompleteness;
}
