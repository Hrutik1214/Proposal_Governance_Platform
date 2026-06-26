package com.innovaura.modules.proposal.mapper;

import com.innovaura.modules.proposal.dto.ProposalResponse;
import com.innovaura.modules.proposal.dto.ProposalStatusResponse;
import com.innovaura.modules.proposal.dto.ProposalSummaryResponse;
import com.innovaura.modules.proposal.entity.Proposal;
import org.springframework.stereotype.Component;

@Component
public class ProposalMapper {

    public ProposalResponse toProposalResponse(Proposal proposal) {
        if (proposal == null) return null;
        return ProposalResponse.builder()
                .id(proposal.getId())
                .title(proposal.getTitle())
                .description(proposal.getDescription())
                .department(proposal.getDepartment())
                .requestedAmount(proposal.getRequestedAmount())
                .approvedAmount(proposal.getApprovedAmount())
                .status(proposal.getStatus())
                .startupName(proposal.getStartupName())
                .problemStatement(proposal.getProblemStatement())
                .proposedStatement(proposal.getProposedStatement())
                .equityOffered(proposal.getEquityOffered())
                .businessModel(proposal.getBusinessModel())
                .industry(proposal.getIndustry())
                .category(proposal.getCategory())
                .teamDetails(proposal.getTeamDetails())
                .demoVideoUrl(proposal.getDemoVideoUrl())
                .submitterId(proposal.getSubmitterId())
                .supportingDocumentPath(proposal.getSupportingDocumentPath())
                .createdAt(proposal.getCreatedAt())
                .updatedAt(proposal.getUpdatedAt())
                .build();
    }

    public ProposalSummaryResponse toProposalSummaryResponse(Proposal proposal) {
        if (proposal == null) return null;
        return ProposalSummaryResponse.builder()
                .id(proposal.getId())
                .title(proposal.getTitle())
                .startupName(proposal.getStartupName())
                .department(proposal.getDepartment())
                .requestedAmount(proposal.getRequestedAmount())
                .status(proposal.getStatus())
                .equityOffered(proposal.getEquityOffered())
                .createdAt(proposal.getCreatedAt())
                .build();
    }

    public ProposalStatusResponse toProposalStatusResponse(Proposal proposal) {
        if (proposal == null) return null;
        return ProposalStatusResponse.builder()
                .proposalId(proposal.getId())
                .status(proposal.getStatus())
                .updatedAt(proposal.getUpdatedAt())
                .build();
    }
}
