package com.innovaura.modules.proposal.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProposalUpdateRequest {

    @NotBlank(message = "Proposal Title is required.")
    @Size(min = 2, max = 30, message = "Proposal Title must be between 2 and 30 characters long.")
    private String title;

    private String description;

    @NotNull(message = "Requested Funding Amount is required.")
    @DecimalMin(value = "0.01", message = "Requested Funding Amount must be greater than zero.")
    private BigDecimal requestedAmount;

    private String supportingDocumentPath;

    @NotBlank(message = "Startup Name is required.")
    @Size(min = 2, max = 30, message = "Startup Name must be between 2 and 30 characters long.")
    private String startupName;

    @NotBlank(message = "Problem Statement is required.")
    private String problemStatement;

    @NotBlank(message = "Proposed Solution Statement is required.")
    private String proposedStatement;

    @NotNull(message = "Equity Offered is required.")
    @DecimalMin(value = "0.00", message = "Equity Offered must be between 0% and 100%.")
    @DecimalMax(value = "100.00", message = "Equity Offered must be between 0% and 100%.")
    private BigDecimal equityOffered;

    private String businessModel;

    @NotBlank(message = "Team Details are required.")
    private String teamDetails;

    private String demoVideoUrl;
}
