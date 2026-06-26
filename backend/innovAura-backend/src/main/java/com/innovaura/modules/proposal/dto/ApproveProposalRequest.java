package com.innovaura.modules.proposal.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveProposalRequest {

    @NotNull(message = "Approved amount is required.")
    @DecimalMin(value = "0.01", message = "Approved amount must be greater than zero.")
    private BigDecimal approvedAmount;
}
