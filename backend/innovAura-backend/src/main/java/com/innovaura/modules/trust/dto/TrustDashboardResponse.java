package com.innovaura.modules.trust.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrustDashboardResponse {

    private Integer proposalId;
    private String title;
    private String startupName;
    private int trustScore;
    private String trustLevel;
    private LocalDateTime lastUpdated;
    private String breakdownJson;

    // Investor Dashboard Indicators
    private boolean founderVerified;
    private String founderVerificationLevel;
    private boolean startupVerified;
    private String startupVerificationStatus;
    private boolean patentVerified;
    private String patentStatus;
    private boolean reviewerApproved;
    private String dueDiligenceStatus;
    private boolean documentsVerified;
    private boolean ndaProtected;
    private String patentRiskLevel;
    private int similarPatentCount;
    private double matchPercentage;
}
