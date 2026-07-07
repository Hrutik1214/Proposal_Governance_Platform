package com.innovaura.modules.trust.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.innovaura.exception.NotFoundException;
import com.innovaura.modules.auth.entity.User;
import com.innovaura.modules.auth.repository.UserRepository;
import com.innovaura.modules.proposal.entity.Proposal;
import com.innovaura.modules.proposal.repository.ProposalRepository;
import com.innovaura.modules.review.entity.DueDiligenceReport;
import com.innovaura.modules.review.entity.Review;
import com.innovaura.modules.review.repository.DueDiligenceRepository;
import com.innovaura.modules.review.repository.ReviewRepository;
import com.innovaura.modules.trust.dto.*;
import com.innovaura.modules.trust.entity.StartupTrustScore;
import com.innovaura.modules.trust.mapper.TrustScoreMapper;
import com.innovaura.modules.trust.repository.TrustScoreRepository;
import com.innovaura.modules.verification.entity.FounderVerification;
import com.innovaura.modules.verification.entity.StartupVerification;
import com.innovaura.modules.verification.repository.FounderVerificationRepository;
import com.innovaura.modules.verification.repository.StartupVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TrustScoreService {

    @Autowired
    private TrustScoreRepository trustScoreRepository;

    @Autowired
    private ProposalRepository proposalRepository;

    @Autowired
    private FounderVerificationRepository founderVerificationRepository;

    @Autowired
    private StartupVerificationRepository startupVerificationRepository;

    @Autowired
    private DueDiligenceRepository dueDiligenceRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TrustScoreMapper trustScoreMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public StartupTrustScore computeTrustScore(Integer proposalId) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new NotFoundException("Proposal not found with id: " + proposalId));

        int score = 20; // Base score

        // 1. Founder Verification Score (max 40)
        int founderPoints = 0;
        FounderVerification fVerification = founderVerificationRepository.findByUserId(proposal.getSubmitterId())
                .filter(fv -> "Verified".equalsIgnoreCase(fv.getStatus()))
                .orElse(null);

        if (fVerification != null) {
            if ("Business".equalsIgnoreCase(fVerification.getVerificationLevel())) {
                founderPoints = 40;
            } else if ("Verified".equalsIgnoreCase(fVerification.getVerificationLevel())) {
                founderPoints = 25;
            } else if ("Basic".equalsIgnoreCase(fVerification.getVerificationLevel())) {
                founderPoints = 10;
            }
        } else {
            User submitter = proposal.getSubmitter();
            if (submitter != null) {
                if ("Verified".equalsIgnoreCase(submitter.getPatentVerificationStatus())) {
                    founderPoints = 15;
                } else if ("Unverified".equalsIgnoreCase(submitter.getPatentVerificationStatus())) {
                    founderPoints = 5;
                }
            }
        }
        score += founderPoints;

        // 2. Startup Verification Score (max 20)
        int startupPoints = 0;
        StartupVerification sVerification = startupVerificationRepository.findByStartupId(proposalId)
                .orElse(null);
        if (sVerification != null) {
            if ("Verified".equalsIgnoreCase(sVerification.getOverallStatus())) {
                startupPoints = 20;
            } else if ("Pending".equalsIgnoreCase(sVerification.getOverallStatus())) {
                startupPoints = 5;
            }
        }
        score += startupPoints;

        // 3. Reviewer Due Diligence Score (max 20)
        int ddPoints = 0;
        DueDiligenceReport ddReport = dueDiligenceRepository.findFirstByStartupIdOrderByCreatedAtDesc(proposalId)
                .orElse(null);

        if (ddReport != null) {
            double avg = (ddReport.getInnovationScore() + ddReport.getMarketPotentialScore() + ddReport.getFeasibilityScore() +
                          ddReport.getTeamStrengthScore() + ddReport.getFinancialReadinessScore() + ddReport.getRiskAssessmentScore() +
                          ddReport.getPatentStrengthScore() + ddReport.getIpStrengthScore()) / 8.0;
            ddPoints = (int) Math.round(avg * 2);
        } else {
            List<Review> reviews = reviewRepository.findByProposalId(proposalId);
            if (!reviews.isEmpty()) {
                Review standardReview = reviews.get(reviews.size() - 1);
                double avg = (standardReview.getFeasibilityScore() + standardReview.getStrategicScore() +
                              standardReview.getRiskScore() + standardReview.getRoiScore()) / 4.0;
                ddPoints = (int) Math.round(avg * 1.5);
            }
        }
        score += ddPoints;

        // 4. Patent Verification Status (max 15)
        int patentPoints = 0;
        User submitterUser = proposal.getSubmitter();
        if (submitterUser != null && submitterUser.getPatentId() != null && !submitterUser.getPatentId().isBlank()) {
            if ("Verified".equalsIgnoreCase(submitterUser.getPatentVerificationStatus())) {
                patentPoints = 15;
            } else {
                patentPoints = 8;
            }
        }
        score += patentPoints;

        // 5. Patent Risk Level
        int riskPoints = 0;
        score += riskPoints;

        // Bounds [0, 100]
        score = Math.max(0, Math.min(100, score));

        String level = "Moderate";
        if (score >= 80) level = "Excellent";
        else if (score >= 60) level = "Good";
        else if (score >= 40) level = "Moderate";
        else level = "High Risk";

        Map<String, Object> breakdown = new HashMap<>();
        breakdown.put("BaseScore", 20);
        breakdown.put("FounderVerificationPoints", founderPoints);
        breakdown.put("StartupVerificationPoints", startupPoints);
        breakdown.put("DueDiligencePoints", ddPoints);
        breakdown.put("PatentVerificationPoints", patentPoints);
        breakdown.put("PatentRiskPoints", riskPoints);
        breakdown.put("FounderStatus", fVerification != null ? fVerification.getVerificationLevel() : "Unverified");
        breakdown.put("StartupStatus", sVerification != null ? sVerification.getOverallStatus() : "Unverified");
        breakdown.put("PatentStatus", submitterUser != null ? submitterUser.getPatentVerificationStatus() : "Unverified");

        String jsonBreakdown;
        try {
            jsonBreakdown = objectMapper.writeValueAsString(breakdown);
        } catch (Exception e) {
            jsonBreakdown = "{}";
        }

        StartupTrustScore trustRecord = trustScoreRepository.findByStartupId(proposalId)
                .orElse(null);

        if (trustRecord == null) {
            trustRecord = StartupTrustScore.builder()
                    .startupId(proposalId)
                    .trustScore(score)
                    .trustLevel(level)
                    .lastUpdated(LocalDateTime.now())
                    .breakdownJson(jsonBreakdown)
                    .build();
        } else {
            trustRecord.setTrustScore(score);
            trustRecord.setTrustLevel(level);
            trustRecord.setLastUpdated(LocalDateTime.now());
            trustRecord.setBreakdownJson(jsonBreakdown);
        }

        return trustScoreRepository.save(trustRecord);
    }

    @Transactional
    public TrustDashboardResponse getTrustDashboard(Integer proposalId) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new NotFoundException("Proposal not found with id: " + proposalId));

        StartupTrustScore trustRecord = computeTrustScore(proposalId);

        FounderVerification fVerification = founderVerificationRepository.findByUserId(proposal.getSubmitterId())
                .orElse(null);
        StartupVerification sVerification = startupVerificationRepository.findByStartupId(proposalId)
                .orElse(null);
        DueDiligenceReport ddReport = dueDiligenceRepository.findFirstByStartupIdOrderByCreatedAtDesc(proposalId)
                .orElse(null);

        return TrustDashboardResponse.builder()
                .proposalId(proposalId)
                .title(proposal.getTitle())
                .startupName(proposal.getStartupName())
                .trustScore(trustRecord.getTrustScore())
                .trustLevel(trustRecord.getTrustLevel())
                .lastUpdated(trustRecord.getLastUpdated())
                .breakdownJson(trustRecord.getBreakdownJson())
                .founderVerified(fVerification != null && "Verified".equalsIgnoreCase(fVerification.getStatus()))
                .founderVerificationLevel(fVerification != null ? fVerification.getVerificationLevel() : "None")
                .startupVerified(sVerification != null && "Verified".equalsIgnoreCase(sVerification.getOverallStatus()))
                .startupVerificationStatus(sVerification != null ? sVerification.getOverallStatus() : "None")
                .patentVerified(proposal.getSubmitter() != null && "Verified".equalsIgnoreCase(proposal.getSubmitter().getPatentVerificationStatus()))
                .patentStatus(proposal.getSubmitter() != null && proposal.getSubmitter().getPatentId() != null ? "Granted" : "NoPatent")
                .reviewerApproved(ddReport != null)
                .dueDiligenceStatus(ddReport != null ? "Approved" : "Pending")
                .documentsVerified(sVerification != null && "Verified".equalsIgnoreCase(sVerification.getOverallStatus()))
                .ndaProtected(false)
                .patentRiskLevel("NoPatentCheck")
                .similarPatentCount(0)
                .matchPercentage(0.0)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TrustScoreResponse> getAllScores() {
        return trustScoreRepository.findAll().stream()
                .map(trustScoreMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvestorTrustScoreResponse getInvestorTrustScore(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

        FounderVerification fVer = founderVerificationRepository.findByUserId(userId).orElse(null);

        int identityPoints = 10;
        boolean panVerified = false;
        boolean aadhaarVerified = false;
        boolean orgVerified = false;

        if (fVer != null && "Verified".equalsIgnoreCase(fVer.getStatus())) {
            identityPoints = 25;
            panVerified = Boolean.TRUE.equals(fVer.getPanVerified());
            aadhaarVerified = Boolean.TRUE.equals(fVer.getAadhaarVerified());
            orgVerified = Boolean.TRUE.equals(fVer.getCompanyRegVerified()) || Boolean.TRUE.equals(fVer.getCinVerified());
        } else if (fVer != null) {
            panVerified = fVer.getPanNumber() != null && !fVer.getPanNumber().isBlank();
            aadhaarVerified = fVer.getAadhaarNumber() != null && !fVer.getAadhaarNumber().isBlank();
        }

        int totalCount = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;
        int activeCount = 0;
        int completedCount = 0;

        int activityPoints = 5;
        double successRate = 100.0;
        int trackRecordPoints = 10;
        int reliabilityPoints = 15;
        int profilePoints = 10;

        int totalScore = Math.max(0, Math.min(100, 20 + identityPoints + activityPoints + trackRecordPoints + reliabilityPoints + profilePoints));
        String level = totalScore >= 80 ? "Excellent" : totalScore >= 60 ? "Good" : totalScore >= 40 ? "Moderate" : "High Risk";

        return InvestorTrustScoreResponse.builder()
                .userId(userId)
                .investorName(user.getFullName() != null ? user.getFullName() : user.getUsername())
                .trustScore(totalScore)
                .trustLevel(level)
                .lastUpdated(LocalDateTime.now())
                .identityVerified(fVer != null && "Verified".equalsIgnoreCase(fVer.getStatus()))
                .panVerified(panVerified)
                .aadhaarVerified(aadhaarVerified)
                .organizationVerified(orgVerified)
                .totalInvestments(totalCount)
                .totalAmountInvested(totalAmount)
                .activeInvestments(activeCount)
                .completedInvestments(completedCount)
                .founderRating(4.9)
                .investmentSuccessRate(successRate)
                .commitmentReliability(100)
                .profileCompleteness(95)
                .build();
    }
}
