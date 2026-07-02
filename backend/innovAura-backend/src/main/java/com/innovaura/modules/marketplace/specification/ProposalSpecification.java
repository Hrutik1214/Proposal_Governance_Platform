package com.innovaura.modules.marketplace.specification;

import com.innovaura.modules.proposal.entity.Proposal;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProposalSpecification {

    public static Specification<Proposal> filterMarketplace(
            String industry,
            String category,
            String department,
            BigDecimal minFunding,
            BigDecimal maxFunding,
            BigDecimal minEquity,
            BigDecimal maxEquity,
            String search
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Rule: Exclude Draft status from Marketplace
            predicates.add(criteriaBuilder.notEqual(
                    criteriaBuilder.lower(root.get("status")), "draft"
            ));

            if (industry != null && !industry.isBlank()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("industry")), industry.trim().toLowerCase()
                ));
            }

            if (category != null && !category.isBlank()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("category")), category.trim().toLowerCase()
                ));
            }

            if (department != null && !department.isBlank()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("department")), department.trim().toLowerCase()
                ));
            }

            if (minFunding != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("requestedAmount"), minFunding
                ));
            }

            if (maxFunding != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("requestedAmount"), maxFunding
                ));
            }

            if (minEquity != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("equityOffered"), minEquity
                ));
            }

            if (maxEquity != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("equityOffered"), maxEquity
                ));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate titleMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern);
                Predicate startupMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("startupName")), pattern);
                Predicate problemMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("problemStatement")), pattern);
                predicates.add(criteriaBuilder.or(titleMatch, startupMatch, problemMatch));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
