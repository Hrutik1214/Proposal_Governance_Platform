package com.innovaura.modules.marketplace.service;

import com.innovaura.exception.NotFoundException;
import com.innovaura.modules.marketplace.dto.MarketplaceDetailResponse;
import com.innovaura.modules.marketplace.dto.MarketplaceListingResponse;
import com.innovaura.modules.marketplace.dto.PagedResponse;
import com.innovaura.modules.marketplace.mapper.MarketplaceMapper;
import com.innovaura.modules.marketplace.specification.ProposalSpecification;
import com.innovaura.modules.proposal.entity.Proposal;
import com.innovaura.modules.proposal.repository.ProposalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Marketplace & Proposal Discovery Service
 */
@Service
@Transactional(readOnly = true)
public class MarketplaceService {

    @Autowired
    private ProposalRepository proposalRepository;

    @Autowired
    private MarketplaceMapper marketplaceMapper;

    @Transactional(readOnly = true)
    public Object browse(
            String industry,
            String category,
            String department,
            BigDecimal minFunding,
            BigDecimal maxFunding,
            BigDecimal minEquity,
            BigDecimal maxEquity,
            String sortBy,
            String search,
            Integer page,
            Integer pageSize
    ) {
        Specification<Proposal> spec = ProposalSpecification.filterMarketplace(
                industry, category, department, minFunding, maxFunding, minEquity, maxEquity, search
        );

        List<Proposal> proposals = proposalRepository.findAll(spec);

        List<MarketplaceListingResponse> responses = proposals.stream()
                .map(marketplaceMapper::toListingResponse)
                .collect(Collectors.toList());

        // Sorting
        if ("funding".equalsIgnoreCase(sortBy)) {
            responses.sort(Comparator.comparing(MarketplaceListingResponse::getRequestedAmount, Comparator.nullsLast(Comparator.reverseOrder())));
        } else if ("equity".equalsIgnoreCase(sortBy)) {
            responses.sort(Comparator.comparing(MarketplaceListingResponse::getEquityOffered, Comparator.nullsLast(Comparator.reverseOrder())));
        } else if ("popular".equalsIgnoreCase(sortBy)) {
            responses.sort(Comparator.comparingInt(MarketplaceListingResponse::getInterestCount).reversed());
        } else {
            // Default recent
            responses.sort(Comparator.comparing(MarketplaceListingResponse::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        }

        // Pagination
        if (page != null) {
            int currentPage = page <= 0 ? 1 : page;
            int effectivePageSize = (pageSize != null && pageSize > 0) ? pageSize : 10;
            int totalCount = responses.size();
            int totalPages = (int) Math.ceil((double) totalCount / effectivePageSize);

            int fromIndex = (currentPage - 1) * effectivePageSize;
            List<MarketplaceListingResponse> pagedItems;
            if (fromIndex >= totalCount) {
                pagedItems = List.of();
            } else {
                int toIndex = Math.min(fromIndex + effectivePageSize, totalCount);
                pagedItems = responses.subList(fromIndex, toIndex);
            }

            return PagedResponse.<MarketplaceListingResponse>builder()
                    .items(pagedItems)
                    .currentPage(currentPage)
                    .pageSize(effectivePageSize)
                    .totalPages(totalPages)
                    .totalCount(totalCount)
                    .hasNext(currentPage < totalPages)
                    .hasPrevious(currentPage > 1)
                    .build();
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public MarketplaceDetailResponse getDetails(Integer proposalId) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new NotFoundException("Proposal not found with id: " + proposalId));

        if ("Draft".equalsIgnoreCase(proposal.getStatus())) {
            throw new NotFoundException("Proposal is in Draft status and not published to Marketplace.");
        }

        return marketplaceMapper.toDetailResponse(proposal);
    }
}
