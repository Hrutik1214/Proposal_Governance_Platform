package com.innovaura.modules.proposal.service;

import com.innovaura.exception.ForbiddenException;
import com.innovaura.exception.NotFoundException;
import com.innovaura.exception.ValidationException;
import com.innovaura.modules.admin.entity.AuditLog;
import com.innovaura.modules.admin.repository.AuditLogRepository;
import com.innovaura.modules.auth.entity.User;
import com.innovaura.modules.auth.repository.UserRepository;
import com.innovaura.modules.notification.entity.Notification;
import com.innovaura.modules.notification.repository.NotificationRepository;
import com.innovaura.modules.proposal.dto.*;
import com.innovaura.modules.proposal.entity.Proposal;
import com.innovaura.modules.proposal.entity.ProposalStatus;
import com.innovaura.modules.proposal.mapper.ProposalMapper;
import com.innovaura.modules.proposal.repository.ProposalRepository;
import com.innovaura.modules.proposal.validation.ProposalWorkflowValidator;
import com.innovaura.security.RoleConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProposalService {

    @Autowired
    private ProposalRepository proposalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ProposalMapper proposalMapper;

    @Autowired
    private ProposalWorkflowValidator workflowValidator;

    @Transactional(readOnly = true)
    public List<ProposalResponse> getAllProposals(String role, Integer userId) {
        List<Proposal> proposals = RoleConstants.ADMIN.equalsIgnoreCase(role) ? 
                proposalRepository.findAll() : proposalRepository.findBySubmitterId(userId);
        } else if (RoleConstants.REVIEWER.equalsIgnoreCase(role) || RoleConstants.INVESTOR.equalsIgnoreCase(role)) {
            proposals = proposalRepository.findByStatusNot("Draft");
        } else {
            throw new ValidationException("Invalid user role.");
        }

        return proposals.stream()
                .map(proposalMapper::toProposalResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProposalResponse getProposalById(Integer id, String role, Integer userId) {
        Proposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Proposal not found with id: " + id));

        if (RoleConstants.FOUNDER.equalsIgnoreCase(role) && !proposal.getSubmitterId().equals(userId)) {
            throw new ForbiddenException("Access denied to requested proposal.");
        }

        return proposalMapper.toProposalResponse(proposal);
    }

    @Transactional
    public ProposalResponse createProposal(ProposalRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));

        validateProposalFields(request.getStartupName(), request.getTitle(), request.getProblemStatement(),
                request.getProposedStatement(), request.getRequestedAmount(), request.getEquityOffered(), request.getTeamDetails());

        Proposal proposal = Proposal.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription() != null ? request.getDescription() : "")
                .department(user.getDepartment() != null ? user.getDepartment() : "General")
                .requestedAmount(request.getRequestedAmount())
                .approvedAmount(BigDecimal.ZERO)
                .status(ProposalStatus.DRAFT.getValue())
                .startupName(request.getStartupName().trim())
                .problemStatement(request.getProblemStatement().trim())
                .proposedStatement(request.getProposedStatement().trim())
                .equityOffered(request.getEquityOffered())
                .businessModel(request.getBusinessModel())
                .teamDetails(request.getTeamDetails().trim())
                .demoVideoUrl(request.getDemoVideoUrl())
                .submitterId(user.getId())
                .supportingDocumentPath(request.getSupportingDocumentPath() != null ? request.getSupportingDocumentPath() : "")
                .build();

        Proposal saved = proposalRepository.save(proposal);

        // Audit persistence
        logAudit(user.getId(), user.getUsername(), "CreateProposal", "Proposal", saved.getId(),
                "Created proposal titled '" + saved.getTitle() + "'");

        return proposalMapper.toProposalResponse(saved);
    }

    @Transactional
    public ProposalResponse updateProposal(Integer id, ProposalUpdateRequest request, Integer userId) {
        Proposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Proposal not found with id: " + id));

        if (!proposal.getSubmitterId().equals(userId)) {
            throw new ForbiddenException("Only the proposal submitter can edit this proposal.");
        }

        if (!ProposalStatus.DRAFT.getValue().equalsIgnoreCase(proposal.getStatus())) {
            throw new ValidationException("Only proposals in Draft state can be edited.");
        }

        validateProposalFields(request.getStartupName(), request.getTitle(), request.getProblemStatement(),
                request.getProposedStatement(), request.getRequestedAmount(), request.getEquityOffered(), request.getTeamDetails());

        proposal.setTitle(request.getTitle().trim());
        proposal.setDescription(request.getDescription() != null ? request.getDescription() : "");
        proposal.setRequestedAmount(request.getRequestedAmount());
        if (request.getSupportingDocumentPath() != null) {
            proposal.setSupportingDocumentPath(request.getSupportingDocumentPath());
        }
        proposal.setStartupName(request.getStartupName().trim());
        proposal.setProblemStatement(request.getProblemStatement().trim());
        proposal.setProposedStatement(request.getProposedStatement().trim());
        proposal.setEquityOffered(request.getEquityOffered());
        proposal.setBusinessModel(request.getBusinessModel());
        proposal.setTeamDetails(request.getTeamDetails().trim());
        proposal.setDemoVideoUrl(request.getDemoVideoUrl());

        Proposal updated = proposalRepository.save(proposal);
        return proposalMapper.toProposalResponse(updated);
    }

    @Transactional
    public void deleteProposal(Integer id, String role, Integer userId) {
        Proposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Proposal not found with id: " + id));

        if (!RoleConstants.ADMIN.equalsIgnoreCase(role) && !proposal.getSubmitterId().equals(userId)) {
            throw new ForbiddenException("Only the proposal submitter or an Administrator can delete this proposal.");
        }

        proposalRepository.delete(proposal);
    }

    @Transactional(readOnly = true)
    public List<ProposalResponse> getMyProposals(Integer userId) {
        return proposalRepository.findBySubmitterId(userId).stream()
                .map(proposalMapper::toProposalResponse)
                .collect(Collectors.toList());
    }

    // ── GOVERNANCE WORKFLOW IMPLEMENTATION (PHASE 3B) ─────────────────────────

    @Transactional
    public ProposalResponse submitProposal(Integer id, Integer userId) {
        Proposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Proposal not found with id: " + id));

        if (!proposal.getSubmitterId().equals(userId)) {
            throw new ForbiddenException("Only the proposal submitter can submit this proposal.");
        }

        ProposalStatus currentStatus = ProposalStatus.fromValue(proposal.getStatus());
        if (currentStatus != ProposalStatus.DRAFT) {
            throw new ValidationException("Proposal has already been submitted.");
        }

        workflowValidator.validateTransition(currentStatus, ProposalStatus.SUBMITTED);

        proposal.setStatus(ProposalStatus.SUBMITTED.getValue());
        Proposal saved = proposalRepository.save(proposal);

        // Persistent Notification for Admin (UserId = 1)
        Notification adminNotification = Notification.builder()
                .userId(1)
                .title("New Proposal Submitted")
                .message("Proposal '" + proposal.getTitle() + "' has been submitted and is awaiting reviewer assignment.")
                .isRead(false)
                .build();
        notificationRepository.save(adminNotification);

        // Persistent Audit Log
        User submitter = userRepository.findById(userId).orElse(null);
        logAudit(userId, submitter != null ? submitter.getUsername() : "founder", "SubmitProposal",
                "Proposal", id, "Submitted proposal titled '" + proposal.getTitle() + "'");

        return proposalMapper.toProposalResponse(saved);
    }

    @Transactional
    public ProposalResponse assignReviewer(Integer id, AssignReviewerRequest request, String adminUsername) {
        Proposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Proposal not found with id: " + id));

        ProposalStatus currentStatus = ProposalStatus.fromValue(proposal.getStatus());
        if (currentStatus != ProposalStatus.SUBMITTED && currentStatus != ProposalStatus.UNDER_REVIEW) {
            throw new ValidationException("Proposal is not in a state for reviewer assignment.");
        }

        User reviewer = userRepository.findById(request.getReviewerId())
                .orElseThrow(() -> new NotFoundException("Reviewer not found with id: " + request.getReviewerId()));

        if (!RoleConstants.REVIEWER.equalsIgnoreCase(reviewer.getRole())) {
            throw new ValidationException("User is not a valid reviewer.");
        }

        workflowValidator.validateTransition(currentStatus, ProposalStatus.UNDER_REVIEW);

        proposal.setStatus(ProposalStatus.UNDER_REVIEW.getValue());
        Proposal saved = proposalRepository.save(proposal);

        // Persistent Notification for Reviewer
        Notification reviewerNotification = Notification.builder()
                .userId(reviewer.getId())
                .title("Proposal Assigned for Review")
                .message("You have been assigned to evaluate the proposal '" + proposal.getTitle() + "' (" + proposal.getDepartment() + " department).")
                .isRead(false)
                .build();
        notificationRepository.save(reviewerNotification);

        // Audit Log
        User admin = userRepository.findByUsername(adminUsername).orElse(null);
        logAudit(admin != null ? admin.getId() : 1, adminUsername, "AssignReviewer", "Proposal", id,
                "Assigned reviewer " + reviewer.getUsername() + " to proposal '" + proposal.getTitle() + "'");

        return proposalMapper.toProposalResponse(saved);
    }

    @Transactional
    public ProposalResponse decideProposal(Integer id, ProposalDecisionRequest request, String adminUsername) {
        Proposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Proposal not found with id: " + id));

        ProposalStatus currentStatus = ProposalStatus.fromValue(proposal.getStatus());
        if (currentStatus != ProposalStatus.REVIEWED && currentStatus != ProposalStatus.UNDER_REVIEW) {
            throw new ValidationException("Proposals must be reviewed before final governance decision.");
        }

        String decision = request.getDecision() != null ? request.getDecision().toLowerCase() : "";
        ProposalStatus targetStatus;

        if ("approve".equals(decision)) {
            if (request.getApprovedAmount() == null || request.getApprovedAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new ValidationException("Approved amount must be greater than zero.");
            }
            targetStatus = ProposalStatus.APPROVED;
            proposal.setApprovedAmount(request.getApprovedAmount());
        } else if ("reject".equals(decision)) {
            targetStatus = ProposalStatus.REJECTED;
            proposal.setApprovedAmount(BigDecimal.ZERO);
        } else {
            throw new ValidationException("Decision must be either 'approve' or 'reject'.");
        }

        workflowValidator.validateTransition(currentStatus, targetStatus);
        proposal.setStatus(targetStatus.getValue());
        Proposal saved = proposalRepository.save(proposal);

        // Persistent Notification for Submitter
        Notification submitterNotification = Notification.builder()
                .userId(proposal.getSubmitterId())
                .title("Proposal Governance Decision: " + targetStatus.getValue())
                .message("Your proposal '" + proposal.getTitle() + "' has been " + targetStatus.getValue().toLowerCase() + ".")
                .isRead(false)
                .build();
        notificationRepository.save(submitterNotification);

        // Audit Log
        User admin = userRepository.findByUsername(adminUsername).orElse(null);
        logAudit(admin != null ? admin.getId() : 1, adminUsername, "DecideProposal", "Proposal", id,
                "Governance decision on proposal '" + proposal.getTitle() + "': " + targetStatus.getValue());

        return proposalMapper.toProposalResponse(saved);
    }

    @Transactional
    public ProposalResponse approveProposal(Integer id, BigDecimal approvedAmount, String adminUsername) {
        ProposalDecisionRequest request = ProposalDecisionRequest.builder()
                .decision("approve")
                .approvedAmount(approvedAmount)
                .build();
        return decideProposal(id, request, adminUsername);
    }

    @Transactional
    public ProposalResponse rejectProposal(Integer id, String adminUsername) {
        ProposalDecisionRequest request = ProposalDecisionRequest.builder()
                .decision("reject")
                .approvedAmount(BigDecimal.ZERO)
                .build();
        return decideProposal(id, request, adminUsername);
    }

    @Transactional
    public ProposalResponse updateStatus(Integer id, String newStatus, String adminUsername) {
        Proposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Proposal not found with id: " + id));

        ProposalStatus currentStatus = ProposalStatus.fromValue(proposal.getStatus());
        ProposalStatus targetStatus = ProposalStatus.fromValue(newStatus);

        workflowValidator.validateTransition(currentStatus, targetStatus);

        proposal.setStatus(targetStatus.getValue());
        Proposal saved = proposalRepository.save(proposal);

        User admin = userRepository.findByUsername(adminUsername).orElse(null);
        logAudit(admin != null ? admin.getId() : 1, adminUsername, "UpdateStatus", "Proposal", id,
                "Changed status of proposal '" + proposal.getTitle() + "' from " + currentStatus.getValue() + " to " + targetStatus.getValue());

        return proposalMapper.toProposalResponse(saved);
    }

    private void logAudit(Integer userId, String username, String action, String entityName, Integer entityId, String details) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .username(username)
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    private void validateProposalFields(String startupName, String title, String problemStatement,
                                       String proposedStatement, BigDecimal requestedAmount,
                                       BigDecimal equityOffered, String teamDetails) {

        if (requestedAmount == null || requestedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Requested Funding Amount must be greater than zero.");
        }
        if (startupName == null || startupName.trim().length() < 2 || startupName.trim().length() > 30) {
            throw new ValidationException("Startup Name must be between 2 and 30 characters long.");
        }
        if (title == null || title.trim().length() < 2 || title.trim().length() > 30) {
            throw new ValidationException("Proposal Title must be between 2 and 30 characters long.");
        }
        if (problemStatement == null || problemStatement.trim().isEmpty()) {
            throw new ValidationException("Problem Statement is required.");
        }
        if (proposedStatement == null || proposedStatement.trim().isEmpty()) {
            throw new ValidationException("Proposed Solution Statement is required.");
        }
        if (equityOffered == null || equityOffered.compareTo(BigDecimal.ZERO) < 0 || equityOffered.compareTo(new BigDecimal("100")) > 0) {
            throw new ValidationException("Equity Offered must be between 0% and 100%.");
        }
        if (teamDetails == null || teamDetails.trim().isEmpty()) {
            throw new ValidationException("Team Details are required.");
        }
    }
}
