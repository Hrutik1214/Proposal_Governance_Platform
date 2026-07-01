package com.innovaura.modules.review.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitDueDiligenceRequest {

    @NotNull(message = "Startup ID (Proposal ID) is required.")
    private Integer startupId;

    @Min(1) @Max(10) private int innovationScore;
    @Min(1) @Max(10) private int marketPotentialScore;
    @Min(1) @Max(10) private int feasibilityScore;
    @Min(1) @Max(10) private int teamStrengthScore;
    @Min(1) @Max(10) private int financialReadinessScore;
    @Min(1) @Max(10) private int riskAssessmentScore;
    @Min(1) @Max(10) private int patentStrengthScore;
    @Min(1) @Max(10) private int ipStrengthScore;

    @NotBlank(message = "Summary is required.")
    private String summary;
}
