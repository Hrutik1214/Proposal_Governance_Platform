package com.innovaura.modules.review.mapper;

import com.innovaura.modules.review.dto.DueDiligenceResponse;
import com.innovaura.modules.review.dto.ReviewResponse;
import com.innovaura.modules.review.entity.DueDiligenceReport;
import com.innovaura.modules.review.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toReviewResponse(Review review) {
        if (review == null) return null;

        double avg = (review.getFeasibilityScore() + review.getStrategicScore() +
                      review.getRiskScore() + review.getRoiScore()) / 4.0;

        String reviewerName = "Reviewer";
        if (review.getReviewer() != null) {
            reviewerName = review.getReviewer().getFullName() != null ?
                    review.getReviewer().getFullName() : review.getReviewer().getUsername();
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .proposalId(review.getProposalId())
                .reviewerId(review.getReviewerId())
                .reviewerName(reviewerName)
                .feasibilityScore(review.getFeasibilityScore())
                .strategicScore(review.getStrategicScore())
                .riskScore(review.getRiskScore())
                .roiScore(review.getRoiScore())
                .comment(review.getComment())
                .averageScore(Math.round(avg * 10.0) / 10.0)
                .submittedAt(review.getSubmittedAt())
                .build();
    }

    public DueDiligenceResponse toDueDiligenceResponse(DueDiligenceReport report) {
        if (report == null) return null;

        String reviewerName = "Reviewer";
        if (report.getReviewer() != null) {
            reviewerName = report.getReviewer().getFullName() != null ?
                    report.getReviewer().getFullName() : report.getReviewer().getUsername();
        }

        return DueDiligenceResponse.builder()
                .id(report.getId())
                .startupId(report.getStartupId())
                .reviewerName(reviewerName)
                .innovationScore(report.getInnovationScore())
                .marketPotentialScore(report.getMarketPotentialScore())
                .feasibilityScore(report.getFeasibilityScore())
                .teamStrengthScore(report.getTeamStrengthScore())
                .financialReadinessScore(report.getFinancialReadinessScore())
                .riskAssessmentScore(report.getRiskAssessmentScore())
                .patentStrengthScore(report.getPatentStrengthScore())
                .ipStrengthScore(report.getIpStrengthScore())
                .summary(report.getSummary())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
