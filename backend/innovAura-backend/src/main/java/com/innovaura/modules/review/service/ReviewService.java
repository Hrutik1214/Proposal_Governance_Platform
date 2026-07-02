package com.innovaura.modules.review.service;

import com.innovaura.exception.NotFoundException;
import com.innovaura.exception.ValidationException;
import com.innovaura.modules.admin.entity.AuditLog;
import com.innovaura.modules.admin.repository.AuditLogRepository;
import com.innovaura.modules.auth.entity.User;
import com.innovaura.modules.auth.repository.UserRepository;
import com.innovaura.modules.notification.entity.Notification;
import com.innovaura.modules.notification.repository.NotificationRepository;
import com.innovaura.modules.proposal.entity.Proposal;
import com.innovaura.modules.proposal.entity.ProposalStatus;
import com.innovaura.modules.proposal.repository.ProposalRepository;
import com.innovaura.modules.review.dto.*;
import com.innovaura.modules.review.entity.DueDiligenceReport;
import com.innovaura.modules.review.entity.Review;
import com.innovaura.modules.review.mapper.ReviewMapper;
import com.innovaura.modules.review.repository.DueDiligenceRepository;
import com.innovaura.modules.review.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Peer Review & Due Diligence Service
 */
@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private DueDiligenceRepository dueDiligenceRepository;

    @Autowired
    private ProposalRepository proposalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ReviewMapper reviewMapper;

    @Transactional
    public ReviewResponse submitReview(ReviewRequest request, Integer reviewerId) {
        Proposal proposal = proposalRepository.findById(request.getProposalId())
                .orElseThrow(() -> new NotFoundException("Proposal not found with id: " + request.getProposalId()));

        String status = proposal.getStatus();
        if (!ProposalStatus.UNDER_REVIEW.getValue().equalsIgnoreCase(status) &&
            !ProposalStatus.SUBMITTED.getValue().equalsIgnoreCase(status)) {
            throw new ValidationException("Proposal is not open for reviews.");
        }

        validateScores(request.getFeasibilityScore(), request.getStrategicScore(),
                request.getRiskScore(), request.getRoiScore());

        User reviewer = userRepository.findById(reviewerId).orElse(null);

        Review review = Review.builder()
                .proposalId(request.getProposalId())
                .reviewerId(reviewerId)
                .feasibilityScore(request.getFeasibilityScore())
                .strategicScore(request.getStrategicScore())
                .riskScore(request.getRiskScore())
                .roiScore(request.getRoiScore())
                .comment(request.getComment().trim())
                .build();

        Review saved = reviewRepository.save(review);

        // Update proposal status to Reviewed
        proposal.setStatus(ProposalStatus.REVIEWED.getValue());
        proposalRepository.save(proposal);

        // Persistent Admin Notification
        Notification adminNotification = Notification.builder()
                .userId(1)
                .title("Proposal Review Submitted")
                .message("Reviewer " + (reviewer != null ? reviewer.getFullName() : "Reviewer") +
                         " has submitted scores for proposal '" + proposal.getTitle() + "'. Status is now Reviewed.")
                .isRead(false)
                .build();
        notificationRepository.save(adminNotification);

        // Persistent Audit Log
        AuditLog auditLog = AuditLog.builder()
                .userId(reviewerId)
                .username(reviewer != null ? reviewer.getUsername() : "reviewer")
                .action("SubmitReview")
                .entityName("Review")
                .entityId(saved.getId())
                .details("Submitted evaluation for proposal '" + proposal.getTitle() + "'")
                .build();
        auditLogRepository.save(auditLog);

        return reviewMapper.toReviewResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByProposalId(Integer proposalId) {
        return reviewRepository.findByProposalId(proposalId).stream()
                .map(reviewMapper::toReviewResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getMyReviews(Integer reviewerId) {
        return reviewRepository.findByReviewerId(reviewerId).stream()
                .map(reviewMapper::toReviewResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReviewSummary calculateAverageScore(Integer proposalId) {
        List<Review> reviews = reviewRepository.findByProposalId(proposalId);
        if (reviews.isEmpty()) {
            return ReviewSummary.builder()
                    .proposalId(proposalId)
                    .reviewCount(0)
                    .averageFeasibility(0.0)
                    .averageStrategic(0.0)
                    .averageRisk(0.0)
                    .averageRoi(0.0)
                    .overallAverageScore(0.0)
                    .build();
        }

        double sumFeasibility = reviews.stream().mapToInt(Review::getFeasibilityScore).sum();
        double sumStrategic = reviews.stream().mapToInt(Review::getStrategicScore).sum();
        double sumRisk = reviews.stream().mapToInt(Review::getRiskScore).sum();
        double sumRoi = reviews.stream().mapToInt(Review::getRoiScore).sum();
        int count = reviews.size();

        double avgF = sumFeasibility / count;
        double avgS = sumStrategic / count;
        double avgR = sumRisk / count;
        double avgRoi = sumRoi / count;
        double overall = (avgF + avgS + avgR + avgRoi) / 4.0;

        return ReviewSummary.builder()
                .proposalId(proposalId)
                .reviewCount(count)
                .averageFeasibility(Math.round(avgF * 10.0) / 10.0)
                .averageStrategic(Math.round(avgS * 10.0) / 10.0)
                .averageRisk(Math.round(avgR * 10.0) / 10.0)
                .averageRoi(Math.round(avgRoi * 10.0) / 10.0)
                .overallAverageScore(Math.round(overall * 10.0) / 10.0)
                .build();
    }

    @Transactional
    public DueDiligenceResponse submitDueDiligence(SubmitDueDiligenceRequest request, Integer reviewerId, String username) {
        Proposal proposal = proposalRepository.findById(request.getStartupId())
                .orElseThrow(() -> new NotFoundException("Proposal not found with id: " + request.getStartupId()));

        User reviewer = userRepository.findById(reviewerId).orElse(null);

        DueDiligenceReport report = DueDiligenceReport.builder()
                .startupId(request.getStartupId())
                .reviewerId(reviewerId)
                .innovationScore(request.getInnovationScore())
                .marketPotentialScore(request.getMarketPotentialScore())
                .feasibilityScore(request.getFeasibilityScore())
                .teamStrengthScore(request.getTeamStrengthScore())
                .financialReadinessScore(request.getFinancialReadinessScore())
                .riskAssessmentScore(request.getRiskAssessmentScore())
                .patentStrengthScore(request.getPatentStrengthScore())
                .ipStrengthScore(request.getIpStrengthScore())
                .summary(request.getSummary().trim())
                .build();

        DueDiligenceReport saved = dueDiligenceRepository.save(report);

        proposal.setStatus(ProposalStatus.REVIEWED.getValue());
        proposalRepository.save(proposal);

        AuditLog auditLog = AuditLog.builder()
                .userId(reviewerId)
                .username(username)
                .action("SubmitDueDiligenceReport")
                .entityName("DueDiligenceReport")
                .entityId(saved.getId())
                .details("Submitted full due diligence report for proposal '" + proposal.getTitle() + "'")
                .build();
        auditLogRepository.save(auditLog);

        return reviewMapper.toDueDiligenceResponse(saved);
    }

    @Transactional(readOnly = true)
    public DueDiligenceResponse getDueDiligenceReport(Integer proposalId) {
        DueDiligenceReport report = dueDiligenceRepository.findFirstByStartupIdOrderByCreatedAtDesc(proposalId)
                .orElseThrow(() -> new NotFoundException("No due diligence report exists for this proposal."));
        return reviewMapper.toDueDiligenceResponse(report);
    }

    @Transactional(readOnly = true)
    public List<DueDiligenceResponse> getAllDueDiligenceReports() {
        return dueDiligenceRepository.findAll().stream()
                .map(reviewMapper::toDueDiligenceResponse)
                .collect(Collectors.toList());
    }

    private void validateScores(int f, int s, int r, int roi) {
        if (f < 1 || f > 10 || s < 1 || s > 10 || r < 1 || r > 10 || roi < 1 || roi > 10) {
            throw new ValidationException("All evaluation scores must be between 1 and 10.");
        }
    }
}
