package com.innovaura.modules.proposal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProposalResponse {

    private Integer id;
    private String title;
    private String description;
    private String department;
    private BigDecimal requestedAmount;
    private BigDecimal approvedAmount;
    private String status;
    private String startupName;
    private String problemStatement;
    private String proposedStatement;
    private BigDecimal equityOffered;
    private String businessModel;
    private String industry;
    private String category;
    private String teamDetails;
    private String demoVideoUrl;
    private Integer submitterId;
    private String supportingDocumentPath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
