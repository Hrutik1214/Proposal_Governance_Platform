package com.innovaura.modules.review.controller;

import com.innovaura.modules.auth.entity.User;
import com.innovaura.modules.auth.repository.UserRepository;
import com.innovaura.modules.review.dto.DueDiligenceResponse;
import com.innovaura.modules.review.dto.SubmitDueDiligenceRequest;
import com.innovaura.modules.review.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/due-diligence")
public class DueDiligenceController {

    @Autowired
    private ReviewService reviewService;

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

    @PostMapping
    @PreAuthorize("hasRole('Reviewer')")
    public ResponseEntity<DueDiligenceResponse> submitDueDiligence(@Valid @RequestBody SubmitDueDiligenceRequest request) {
        Integer reviewerId = getCurrentUserId();
        String username = getCurrentUsername();
        DueDiligenceResponse response = reviewService.submitDueDiligence(request, reviewerId, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{proposalId}")
    public ResponseEntity<DueDiligenceResponse> getReport(@PathVariable Integer proposalId) {
        DueDiligenceResponse response = reviewService.getDueDiligenceReport(proposalId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<List<DueDiligenceResponse>> getAllReports() {
        List<DueDiligenceResponse> responses = reviewService.getAllDueDiligenceReports();
        return ResponseEntity.ok(responses);
    }
}
