package com.innovaura.modules.verification.controller;

import com.innovaura.modules.auth.entity.User;
import com.innovaura.modules.auth.repository.UserRepository;
import com.innovaura.modules.verification.dto.*;
import com.innovaura.modules.verification.service.VerificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/verification")
public class VerificationController {

    @Autowired
    private VerificationService verificationService;

    @Autowired
    private UserRepository userRepository;

    private Integer getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = auth != null ? userRepository.findByUsername(auth.getName()).orElse(null) : null;
        return user != null ? user.getId() : 0;
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "";
    }

    @PostMapping("/founder/submit")
    @PreAuthorize("hasRole('Founder')")
    public ResponseEntity<FounderVerificationResponse> submitFounderVerification(@Valid @RequestBody SubmitFounderVerificationRequest request) {
        Integer userId = getCurrentUserId();
        String username = getCurrentUsername();
        FounderVerificationResponse response = verificationService.submitFounderVerification(request, userId, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/founder/status")
    public ResponseEntity<FounderVerificationResponse> getFounderVerificationStatus() {
        Integer userId = getCurrentUserId();
        FounderVerificationResponse response = verificationService.getFounderStatus(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/founder/status/{userId}")
    public ResponseEntity<FounderVerificationResponse> getFounderVerificationStatusById(@PathVariable Integer userId) {
        FounderVerificationResponse response = verificationService.getFounderStatus(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/startup/submit")
    @PreAuthorize("hasRole('Founder')")
    public ResponseEntity<StartupVerificationResponse> submitStartupVerification(@Valid @RequestBody SubmitStartupVerificationRequest request) {
        Integer userId = getCurrentUserId();
        String username = getCurrentUsername();
        StartupVerificationResponse response = verificationService.submitStartupVerification(request, userId, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/startup/{proposalId}")
    public ResponseEntity<StartupVerificationResponse> getStartupVerificationStatus(@PathVariable Integer proposalId) {
        StartupVerificationResponse response = verificationService.getStartupStatus(proposalId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<PendingVerificationsResponse> getPendingVerifications() {
        PendingVerificationsResponse response = verificationService.getPendingVerifications();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/approve/founder/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<FounderVerificationResponse> approveFounder(@PathVariable Integer id, @RequestBody(required = false) AdminReviewRequest request) {
        Integer adminId = getCurrentUserId();
        String adminUsername = getCurrentUsername();
        if (request == null) request = new AdminReviewRequest();
        FounderVerificationResponse response = verificationService.approveFounder(id, request, adminId, adminUsername);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/reject/founder/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<FounderVerificationResponse> rejectFounder(@PathVariable Integer id, @RequestBody(required = false) AdminReviewRequest request) {
        Integer adminId = getCurrentUserId();
        String adminUsername = getCurrentUsername();
        if (request == null) request = new AdminReviewRequest();
        FounderVerificationResponse response = verificationService.rejectFounder(id, request, adminId, adminUsername);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/approve/startup/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<StartupVerificationResponse> approveStartup(@PathVariable Integer id, @RequestBody(required = false) AdminReviewRequest request) {
        Integer adminId = getCurrentUserId();
        String adminUsername = getCurrentUsername();
        if (request == null) request = new AdminReviewRequest();
        StartupVerificationResponse response = verificationService.approveStartup(id, request, adminId, adminUsername);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/reject/startup/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<StartupVerificationResponse> rejectStartup(@PathVariable Integer id, @RequestBody(required = false) AdminReviewRequest request) {
        Integer adminId = getCurrentUserId();
        String adminUsername = getCurrentUsername();
        if (request == null) request = new AdminReviewRequest();
        StartupVerificationResponse response = verificationService.rejectStartup(id, request, adminId, adminUsername);
        return ResponseEntity.ok(response);
    }

    // ── PROMPT STEP 7 EXACT ALIAS ROUTES ─────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('Founder')")
    public ResponseEntity<FounderVerificationResponse> submitVerificationAlias(@Valid @RequestBody SubmitFounderVerificationRequest request) {
        return submitFounderVerification(request);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FounderVerificationResponse> getVerificationByIdAlias(@PathVariable Integer id) {
        return getFounderVerificationStatusById(id);
    }

    @GetMapping("/my")
    public ResponseEntity<FounderVerificationResponse> getMyVerificationAlias() {
        return getFounderVerificationStatus();
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<FounderVerificationResponse> approveVerificationAlias(@PathVariable Integer id, @RequestBody(required = false) AdminReviewRequest request) {
        return approveFounder(id, request);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<FounderVerificationResponse> rejectVerificationAlias(@PathVariable Integer id, @RequestBody(required = false) AdminReviewRequest request) {
        return rejectFounder(id, request);
    }
}
