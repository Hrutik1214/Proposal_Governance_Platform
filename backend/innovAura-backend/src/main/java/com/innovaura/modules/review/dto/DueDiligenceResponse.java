package com.innovaura.modules.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DueDiligenceResponse {

    private Integer id;
    private Integer startupId;
    private String reviewerName;
    private int innovationScore;
    private int marketPotentialScore;
    private int feasibilityScore;
    private int teamStrengthScore;
    private int financialReadinessScore;
    private int riskAssessmentScore;
    private int patentStrengthScore;
    private int ipStrengthScore;
    private String summary;
    private LocalDateTime createdAt;
}
