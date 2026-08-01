package com.innovaura.modules.marketplace.mapper;

import com.innovaura.modules.auth.entity.User;
import com.innovaura.modules.marketplace.dto.MarketplaceDetailResponse;
import com.innovaura.modules.marketplace.dto.MarketplaceListingResponse;
import com.innovaura.modules.marketplace.dto.SubmitterDTO;
import com.innovaura.modules.proposal.entity.Proposal;
import org.springframework.stereotype.Component;

@Component
public class MarketplaceMapper {

    public MarketplaceListingResponse toListingResponse(Proposal proposal) {
        if (proposal == null) return null;

        User submitterUser = proposal.getSubmitter();
        SubmitterDTO submitterDTO = SubmitterDTO.builder()
                .submitterId(proposal.getSubmitterId())
                .fullName(submitterUser != null && submitterUser.getFullName() != null ? submitterUser.getFullName() : "Unknown User")
                .role(submitterUser != null ? submitterUser.getRole() : "Submitter")
                .department(submitterUser != null ? submitterUser.getDepartment() : "")
                .patentVerificationStatus(submitterUser != null ? submitterUser.getPatentVerificationStatus() : "Unverified")
                .patentId(submitterUser != null ? submitterUser.getPatentId() : "")
                .build();

        return MarketplaceListingResponse.builder()
                .id(proposal.getId())
                .title(proposal.getTitle())
                .description(proposal.getDescription())
                .department(proposal.getDepartment())
                .requestedAmount(proposal.getRequestedAmount())
                .approvedAmount(proposal.getApprovedAmount())
                .status(proposal.getStatus())
                .createdAt(proposal.getCreatedAt())
                .updatedAt(proposal.getUpdatedAt())
                .startupName(proposal.getStartupName())
                .problemStatement(proposal.getProblemStatement())
                .proposedStatement(proposal.getProposedStatement())
                .equityOffered(proposal.getEquityOffered())
                .businessModel(proposal.getBusinessModel())
                .teamDetails(proposal.getTeamDetails())
                .demoVideoUrl(proposal.getDemoVideoUrl())
                .industry(proposal.getIndustry())
                .category(proposal.getCategory())
                .submitter(submitterDTO)
                .likeCount(0)
                .hasLiked(false)
                .commentCount(0)
                .interestCount(0)
                .hasInterested(false)
                .build();
    }

    public MarketplaceDetailResponse toDetailResponse(Proposal proposal) {
        if (proposal == null) return null;

        User submitterUser = proposal.getSubmitter();
        SubmitterDTO submitterDTO = SubmitterDTO.builder()
                .submitterId(proposal.getSubmitterId())
                .fullName(submitterUser != null && submitterUser.getFullName() != null ? submitterUser.getFullName() : "Unknown User")
                .role(submitterUser != null && submitterUser.getRole() != null ? submitterUser.getRole() : "Submitter")
                .department(submitterUser != null && submitterUser.getDepartment() != null ? submitterUser.getDepartment() : "")
                .patentVerificationStatus(submitterUser != null && submitterUser.getPatentVerificationStatus() != null ? submitterUser.getPatentVerificationStatus() : "Unverified")
                .patentId(submitterUser != null && submitterUser.getPatentId() != null ? submitterUser.getPatentId() : "")
                .build();

        return MarketplaceDetailResponse.builder()
                .id(proposal.getId())
                .title(proposal.getTitle())
                .description(proposal.getDescription())
                .department(proposal.getDepartment())
                .requestedAmount(proposal.getRequestedAmount())
                .approvedAmount(proposal.getApprovedAmount())
                .status(proposal.getStatus())
                .createdAt(proposal.getCreatedAt())
                .updatedAt(proposal.getUpdatedAt())
                .startupName(proposal.getStartupName())
                .problemStatement(proposal.getProblemStatement())
                .proposedStatement(proposal.getProposedStatement())
                .equityOffered(proposal.getEquityOffered())
                .businessModel(proposal.getBusinessModel())
                .teamDetails(proposal.getTeamDetails())
                .demoVideoUrl(proposal.getDemoVideoUrl())
                .industry(proposal.getIndustry())
                .category(proposal.getCategory())
                .submitter(submitterDTO)
                .likeCount(0)
                .hasLiked(false)
                .commentCount(0)
                .interestCount(0)
                .hasInterested(false)
                .build();
    }
}
