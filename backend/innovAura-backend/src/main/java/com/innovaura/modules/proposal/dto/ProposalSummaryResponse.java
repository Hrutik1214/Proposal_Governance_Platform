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
public class ProposalSummaryResponse {

    private Integer id;
    private String title;
    private String startupName;
    private String department;
    private BigDecimal requestedAmount;
    private String status;
    private BigDecimal equityOffered;
    private LocalDateTime createdAt;
}
