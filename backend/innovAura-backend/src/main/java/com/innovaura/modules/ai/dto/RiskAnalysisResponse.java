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
public class RiskAnalysisResponse {

    private Integer proposalId;
    private String riskLevel; // "Low", "Medium", "High"
    private int riskScore;
    private List<String> marketRisks;
    private List<String> technicalRisks;
    private List<String> regulatoryRisks;
    private List<String> mitigationStrategies;
}
