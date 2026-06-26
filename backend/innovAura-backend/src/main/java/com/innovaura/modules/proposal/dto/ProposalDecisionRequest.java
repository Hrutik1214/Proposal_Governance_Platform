package com.innovaura.modules.proposal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProposalDecisionRequest {

    @NotBlank(message = "Decision is required (approve or reject).")
    private String decision;

    private BigDecimal approvedAmount;
}
