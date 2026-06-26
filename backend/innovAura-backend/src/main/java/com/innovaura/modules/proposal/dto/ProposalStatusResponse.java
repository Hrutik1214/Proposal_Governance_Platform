package com.innovaura.modules.proposal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProposalStatusResponse {

    private Integer proposalId;
    private String status;
    private LocalDateTime updatedAt;
}
