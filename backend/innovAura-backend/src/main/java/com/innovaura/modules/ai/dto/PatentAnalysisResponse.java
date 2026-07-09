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
public class PatentAnalysisResponse {

    private String patentId;
    private String patentTitle;
    private String noveltyAssessment;
    private String claimStrength;
    private List<String> similarPatentsFound;
    private String overallRisk;
}
