package com.innovaura.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisResponse {

    private Integer proposalId;
    private String title;
    private String executiveSummary;
    private int feasibilityRating;
    private int riskRating;
    private int marketPotentialRating;
    private List<String> keyStrengths;
    private List<String> keyRisks;
    private List<String> recommendations;
}
