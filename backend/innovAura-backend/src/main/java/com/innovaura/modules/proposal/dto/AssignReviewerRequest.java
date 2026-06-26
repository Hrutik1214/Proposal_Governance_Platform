package com.innovaura.modules.proposal.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignReviewerRequest {

    @NotNull(message = "Reviewer ID is required.")
    private Integer reviewerId;

    private String notes;
}
