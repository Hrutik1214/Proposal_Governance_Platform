package com.innovaura.modules.review.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {

    @NotNull(message = "Proposal ID is required.")
    @JsonAlias({"ProposalId", "proposalId"})
    private Integer proposalId;

    @Min(value = 1, message = "Feasibility Score must be between 1 and 10.")
    @Max(value = 10, message = "Feasibility Score must be between 1 and 10.")
    @JsonAlias({"FeasibilityScore", "feasibilityScore"})
    private int feasibilityScore;

    @Min(value = 1, message = "Strategic Score must be between 1 and 10.")
    @Max(value = 10, message = "Strategic Score must be between 1 and 10.")
    @JsonAlias({"StrategicScore", "strategicScore"})
    private int strategicScore;

    @Min(value = 1, message = "Risk Score must be between 1 and 10.")
    @Max(value = 10, message = "Risk Score must be between 1 and 10.")
    @JsonAlias({"RiskScore", "riskScore"})
    private int riskScore;

    @Min(value = 1, message = "ROI Score must be between 1 and 10.")
    @Max(value = 10, message = "ROI Score must be between 1 and 10.")
    @JsonAlias({"RoiScore", "roiScore"})
    private int roiScore;

    @NotBlank(message = "Comment is required.")
    @JsonAlias({"Comment", "comment"})
    private String comment;
}
