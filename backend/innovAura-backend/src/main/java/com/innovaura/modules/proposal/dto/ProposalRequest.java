package com.innovaura.modules.proposal.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
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
public class ProposalRequest {

    @NotBlank(message = "Proposal Title is required.")
    @Size(min = 2, max = 30, message = "Proposal Title must be between 2 and 30 characters long.")
    @JsonAlias({"Title", "title"})
    private String title;

    @JsonAlias({"Description", "description"})
    private String description;

    @NotNull(message = "Requested Funding Amount is required.")
    @DecimalMin(value = "0.01", message = "Requested Funding Amount must be greater than zero.")
    @JsonAlias({"RequestedAmount", "requestedAmount"})
    private BigDecimal requestedAmount;

    @JsonAlias({"SupportingDocumentPath", "supportingDocumentPath"})
    private String supportingDocumentPath;

    @NotBlank(message = "Startup Name is required.")
    @Size(min = 2, max = 30, message = "Startup Name must be between 2 and 30 characters long.")
    @JsonAlias({"StartupName", "startupName"})
    private String startupName;

    @NotBlank(message = "Problem Statement is required.")
    @JsonAlias({"ProblemStatement", "problemStatement"})
    private String problemStatement;

    @NotBlank(message = "Proposed Solution Statement is required.")
    @JsonAlias({"ProposedStatement", "proposedStatement"})
    private String proposedStatement;

    @NotNull(message = "Equity Offered is required.")
    @DecimalMin(value = "0.00", message = "Equity Offered must be between 0% and 100%.")
    @DecimalMax(value = "100.00", message = "Equity Offered must be between 0% and 100%.")
    @JsonAlias({"EquityOffered", "equityOffered"})
    private BigDecimal equityOffered;

    @JsonAlias({"BusinessModel", "businessModel"})
    private String businessModel;

    @NotBlank(message = "Team Details are required.")
    @JsonAlias({"TeamDetails", "teamDetails"})
    private String teamDetails;

    @JsonAlias({"DemoVideoUrl", "demoVideoUrl"})
    private String demoVideoUrl;
}
