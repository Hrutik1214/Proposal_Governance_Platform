package com.innovaura.modules.proposal.controller;

import com.innovaura.modules.auth.entity.User;
import com.innovaura.modules.auth.repository.UserRepository;
import com.innovaura.modules.proposal.dto.*;
import com.innovaura.modules.proposal.service.ProposalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Proposal Management REST Controller
 */
@RestController
@RequestMapping("/api/proposals")
public class ProposalController {

    @Autowired
    private ProposalService proposalService;

    @Autowired
    private UserRepository userRepository;

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    private User getCurrentUserEntity() {
        String username = getCurrentUsername();
        return userRepository.findByUsername(username).orElse(null);
    }

    private String getCurrentUserRole() {
        User user = getCurrentUserEntity();
        return user != null ? user.getRole() : "";
    }

    private Integer getCurrentUserId() {
        User user = getCurrentUserEntity();
        return user != null ? user.getId() : 0;
    }

    @GetMapping
    public ResponseEntity<List<ProposalResponse>> getAllProposals() {
        String role = getCurrentUserRole();
        Integer userId = getCurrentUserId();
        List<ProposalResponse> responses = proposalService.getAllProposals(role, userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProposalResponse> getProposalById(@PathVariable Integer id) {
        String role = getCurrentUserRole();
        Integer userId = getCurrentUserId();
        ProposalResponse response = proposalService.getProposalById(id, role, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('Founder')")
    public ResponseEntity<List<ProposalResponse>> getMyProposals() {
        Integer userId = getCurrentUserId();
        List<ProposalResponse> responses = proposalService.getMyProposals(userId);
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @PreAuthorize("hasRole('Founder')")
    public ResponseEntity<ProposalResponse> createProposal(@Valid @RequestBody ProposalRequest request) {
        String username = getCurrentUsername();
        ProposalResponse response = proposalService.createProposal(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Founder')")
    public ResponseEntity<ProposalResponse> updateProposal(@PathVariable Integer id,
                                                           @Valid @RequestBody ProposalUpdateRequest request) {
        Integer userId = getCurrentUserId();
        ProposalResponse response = proposalService.updateProposal(id, request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProposal(@PathVariable Integer id) {
        String role = getCurrentUserRole();
        Integer userId = getCurrentUserId();
        proposalService.deleteProposal(id, role, userId);
        return ResponseEntity.noContent().build();
    }

    // ── GOVERNANCE WORKFLOW ENDPOINTS (PHASE 3B) ──────────────────────────────

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('Founder')")
    public ResponseEntity<ProposalResponse> submitProposal(@PathVariable Integer id) {
        Integer userId = getCurrentUserId();
        ProposalResponse response = proposalService.submitProposal(id, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/assign-reviewer")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<ProposalResponse> assignReviewer(@PathVariable Integer id,
                                                           @Valid @RequestBody AssignReviewerRequest request) {
        String username = getCurrentUsername();
        ProposalResponse response = proposalService.assignReviewer(id, request, username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/decide")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<ProposalResponse> decideProposal(@PathVariable Integer id,
                                                           @Valid @RequestBody ProposalDecisionRequest request) {
        String username = getCurrentUsername();
        ProposalResponse response = proposalService.decideProposal(id, request, username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<ProposalResponse> approveProposal(@PathVariable Integer id,
                                                            @Valid @RequestBody ApproveProposalRequest request) {
        String username = getCurrentUsername();
        ProposalResponse response = proposalService.approveProposal(id, request.getApprovedAmount(), username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<ProposalResponse> rejectProposal(@PathVariable Integer id) {
        String username = getCurrentUsername();
        ProposalResponse response = proposalService.rejectProposal(id, username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<ProposalResponse> updateStatus(@PathVariable Integer id,
                                                         @Valid @RequestBody UpdateStatusRequest request) {
        String username = getCurrentUsername();
        ProposalResponse response = proposalService.updateStatus(id, request.getStatus(), username);
        return ResponseEntity.ok(response);
    }
}
