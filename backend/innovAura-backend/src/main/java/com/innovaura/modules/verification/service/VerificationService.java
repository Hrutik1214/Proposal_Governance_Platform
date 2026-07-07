package com.innovaura.modules.verification.service;

import com.innovaura.exception.NotFoundException;
import com.innovaura.exception.ValidationException;
import com.innovaura.modules.admin.entity.AuditLog;
import com.innovaura.modules.admin.repository.AuditLogRepository;
import com.innovaura.modules.auth.validation.AuthValidationUtils;
import com.innovaura.modules.proposal.entity.Proposal;
import com.innovaura.modules.proposal.repository.ProposalRepository;
import com.innovaura.modules.verification.dto.*;
import com.innovaura.modules.verification.entity.FounderVerification;
import com.innovaura.modules.verification.entity.StartupVerification;
import com.innovaura.modules.verification.mapper.VerificationMapper;
import com.innovaura.modules.verification.repository.FounderVerificationRepository;
import com.innovaura.modules.verification.repository.StartupVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Founder & Startup KYC Verification Service
 */
@Service
public class VerificationService {

    @Autowired
    private FounderVerificationRepository founderVerificationRepository;

    @Autowired
    private StartupVerificationRepository startupVerificationRepository;

    @Autowired
    private ProposalRepository proposalRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private VerificationMapper verificationMapper;

    @Transactional
    public FounderVerificationResponse submitFounderVerification(SubmitFounderVerificationRequest request, Integer userId, String username) {
        String level = request.getVerificationLevel() != null ? request.getVerificationLevel() : "Basic";

        FounderVerification existing = founderVerificationRepository.findByUserId(userId)
                .orElse(null);

        if (existing != null && "Verified".equalsIgnoreCase(existing.getStatus())) {
            throw new ValidationException("You are already verified.");
        }

        if (existing == null) {
            existing = FounderVerification.builder()
                    .userId(userId)
                    .build();
        }

        existing.setVerificationLevel(level);
        existing.setPanNumber(request.getPanNumber() != null ? request.getPanNumber().trim().toUpperCase() : null);
        existing.setAadhaarNumber(request.getAadhaarNumber() != null ? request.getAadhaarNumber().trim() : null);
        existing.setLinkedInUrl(request.getLinkedInUrl() != null ? request.getLinkedInUrl().trim() : null);
        existing.setGstNumber(request.getGstNumber() != null ? request.getGstNumber().trim().toUpperCase() : null);
        existing.setRegistrationNumber(request.getRegistrationNumber() != null ? request.getRegistrationNumber().trim() : null);
        existing.setCinNumber(request.getCinNumber() != null ? request.getCinNumber().trim().toUpperCase() : null);
        existing.setDocumentUrl(request.getDocumentUrl() != null ? request.getDocumentUrl().trim() : null);
        existing.setStatus("Pending");
        existing.setCheckedById(null);
        existing.setCheckedAt(null);
        existing.setNotes(request.getNotes());
        existing.setEmailVerified(true);
        existing.setMobileVerified(true);

        FounderVerification saved = founderVerificationRepository.save(existing);

        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .username(username)
                .action("SubmitFounderVerification")
                .entityName("FounderVerification")
                .entityId(saved.getId())
                .details("Submitted founder verification request for level '" + level + "'")
                .build();
        auditLogRepository.save(auditLog);

        return verificationMapper.toFounderResponse(saved);
    }

    @Transactional(readOnly = true)
    public FounderVerificationResponse getFounderStatus(Integer userId) {
        FounderVerification verification = founderVerificationRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("No founder verification record found for user id: " + userId));
        return verificationMapper.toFounderResponse(verification);
    }

    @Transactional
    public StartupVerificationResponse submitStartupVerification(SubmitStartupVerificationRequest request, Integer userId, String username) {
        Proposal proposal = proposalRepository.findById(request.getStartupId())
                .orElseThrow(() -> new NotFoundException("Startup proposal not found with id: " + request.getStartupId()));

        if (!proposal.getSubmitterId().equals(userId)) {
            throw new ValidationException("Startup proposal not found or you do not own it.");
        }

        StartupVerification existing = startupVerificationRepository.findByStartupId(request.getStartupId())
                .orElse(null);

        if (existing == null) {
            existing = StartupVerification.builder()
                    .startupId(request.getStartupId())
                    .build();
        }

        existing.setRegistrationCertificateUrl(request.getRegistrationCertificateUrl());
        existing.setRegistrationCertificateStatus("Pending");
        existing.setGstDocumentUrl(request.getGstDocumentUrl());
        existing.setGstDocumentStatus("Pending");
        existing.setPanDocumentUrl(request.getPanDocumentUrl());
        existing.setPanDocumentStatus("Pending");
        existing.setFinancialStatementsUrl(request.getFinancialStatementsUrl());
        existing.setFinancialStatementsStatus("Pending");
        existing.setPitchDeckUrl(request.getPitchDeckUrl());
        existing.setPitchDeckStatus("Pending");
        existing.setOverallStatus("Pending");
        existing.setVerifiedById(null);
        existing.setVerifiedAt(null);
        existing.setNotes(request.getNotes());

        StartupVerification saved = startupVerificationRepository.save(existing);

        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .username(username)
                .action("SubmitStartupVerification")
                .entityName("StartupVerification")
                .entityId(saved.getId())
                .details("Submitted startup verification documents for proposal ID " + request.getStartupId())
                .build();
        auditLogRepository.save(auditLog);

        return verificationMapper.toStartupResponse(saved);
    }

    @Transactional(readOnly = true)
    public StartupVerificationResponse getStartupStatus(Integer proposalId) {
        StartupVerification verification = startupVerificationRepository.findByStartupId(proposalId)
                .orElseThrow(() -> new NotFoundException("No startup verification record found for proposal id: " + proposalId));
        return verificationMapper.toStartupResponse(verification);
    }

    @Transactional(readOnly = true)
    public PendingVerificationsResponse getPendingVerifications() {
        List<FounderVerificationResponse> founders = founderVerificationRepository.findByStatus("Pending").stream()
                .map(verificationMapper::toFounderResponse)
                .collect(Collectors.toList());

        List<StartupVerificationResponse> startups = startupVerificationRepository.findByOverallStatus("Pending").stream()
                .map(verificationMapper::toStartupResponse)
                .collect(Collectors.toList());

        return PendingVerificationsResponse.builder()
                .founders(founders)
                .startups(startups)
                .build();
    }

    @Transactional
    public FounderVerificationResponse approveFounder(Integer id, AdminReviewRequest request, Integer adminId, String adminUsername) {
        FounderVerification verification = founderVerificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Founder verification record not found with id: " + id));

        verification.setStatus("Verified");
        verification.setCheckedById(adminId);
        verification.setCheckedAt(LocalDateTime.now());
        if (request.getNotes() != null) verification.setNotes(request.getNotes());

        verification.setEmailVerified(true);
        verification.setMobileVerified(true);
        if ("Verified".equalsIgnoreCase(verification.getVerificationLevel()) || "Business".equalsIgnoreCase(verification.getVerificationLevel())) {
            verification.setPanVerified(true);
            verification.setAadhaarVerified(true);
            verification.setLinkedInVerified(true);
        }
        if ("Business".equalsIgnoreCase(verification.getVerificationLevel())) {
            verification.setGstVerified(true);
            verification.setCompanyRegVerified(true);
            verification.setCinVerified(true);
        }

        FounderVerification saved = founderVerificationRepository.save(verification);

        AuditLog auditLog = AuditLog.builder()
                .userId(adminId)
                .username(adminUsername)
                .action("ApproveFounderVerification")
                .entityName("FounderVerification")
                .entityId(id)
                .details("Approved verification level '" + verification.getVerificationLevel() + "'")
                .build();
        auditLogRepository.save(auditLog);

        return verificationMapper.toFounderResponse(saved);
    }

    @Transactional
    public FounderVerificationResponse rejectFounder(Integer id, AdminReviewRequest request, Integer adminId, String adminUsername) {
        FounderVerification verification = founderVerificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Founder verification record not found with id: " + id));

        verification.setStatus("Rejected");
        verification.setCheckedById(adminId);
        verification.setCheckedAt(LocalDateTime.now());
        if (request.getNotes() != null) verification.setNotes(request.getNotes());

        FounderVerification saved = founderVerificationRepository.save(verification);

        AuditLog auditLog = AuditLog.builder()
                .userId(adminId)
                .username(adminUsername)
                .action("RejectFounderVerification")
                .entityName("FounderVerification")
                .entityId(id)
                .details("Rejected founder verification. Reason: " + request.getNotes())
                .build();
        auditLogRepository.save(auditLog);

        return verificationMapper.toFounderResponse(saved);
    }

    @Transactional
    public StartupVerificationResponse approveStartup(Integer id, AdminReviewRequest request, Integer adminId, String adminUsername) {
        StartupVerification verification = startupVerificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Startup verification record not found with id: " + id));

        verification.setOverallStatus("Verified");
        verification.setRegistrationCertificateStatus("Verified");
        verification.setGstDocumentStatus("Verified");
        verification.setPanDocumentStatus("Verified");
        verification.setFinancialStatementsStatus("Verified");
        verification.setPitchDeckStatus("Verified");
        verification.setVerifiedById(adminId);
        verification.setVerifiedAt(LocalDateTime.now());
        if (request.getNotes() != null) verification.setNotes(request.getNotes());

        StartupVerification saved = startupVerificationRepository.save(verification);

        AuditLog auditLog = AuditLog.builder()
                .userId(adminId)
                .username(adminUsername)
                .action("ApproveStartupVerification")
                .entityName("StartupVerification")
                .entityId(id)
                .details("Approved startup verification for proposal ID: " + verification.getStartupId())
                .build();
        auditLogRepository.save(auditLog);

        return verificationMapper.toStartupResponse(saved);
    }

    @Transactional
    public StartupVerificationResponse rejectStartup(Integer id, AdminReviewRequest request, Integer adminId, String adminUsername) {
        StartupVerification verification = startupVerificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Startup verification record not found with id: " + id));

        verification.setOverallStatus("Rejected");
        verification.setRegistrationCertificateStatus("Rejected");
        verification.setGstDocumentStatus("Rejected");
        verification.setPanDocumentStatus("Rejected");
        verification.setFinancialStatementsStatus("Rejected");
        verification.setPitchDeckStatus("Rejected");
        verification.setVerifiedById(adminId);
        verification.setVerifiedAt(LocalDateTime.now());
        if (request.getNotes() != null) verification.setNotes(request.getNotes());

        StartupVerification saved = startupVerificationRepository.save(verification);

        AuditLog auditLog = AuditLog.builder()
                .userId(adminId)
                .username(adminUsername)
                .action("RejectStartupVerification")
                .entityName("StartupVerification")
                .entityId(id)
                .details("Rejected startup verification for proposal ID: " + verification.getStartupId())
                .build();
        auditLogRepository.save(auditLog);

        return verificationMapper.toStartupResponse(saved);
    }
}
