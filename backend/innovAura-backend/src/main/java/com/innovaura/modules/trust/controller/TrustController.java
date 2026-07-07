package com.innovaura.modules.trust.controller;

import com.innovaura.modules.auth.entity.User;
import com.innovaura.modules.auth.repository.UserRepository;
import com.innovaura.modules.trust.dto.*;
import com.innovaura.modules.trust.entity.StartupTrustScore;
import com.innovaura.modules.trust.service.TrustScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
public class TrustController {

    @Autowired
    private TrustScoreService trustScoreService;

    @Autowired
    private UserRepository userRepository;

    private Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        return user != null ? user.getId() : 0;
    }

    @GetMapping({"/api/trust/{proposalId}", "/api/trust-score/{proposalId}"})
    public ResponseEntity<TrustDashboardResponse> getTrustDashboard(@PathVariable Integer proposalId) {
        TrustDashboardResponse response = trustScoreService.getTrustDashboard(proposalId);
        return ResponseEntity.ok(response);
    }

    @GetMapping({"/api/trust/{proposalId}/history", "/api/trust-score/{proposalId}/history"})
    public ResponseEntity<TrustDashboardResponse> getTrustHistory(@PathVariable Integer proposalId) {
        TrustDashboardResponse response = trustScoreService.getTrustDashboard(proposalId);
        return ResponseEntity.ok(response);
    }

    @PostMapping({"/api/trust/recompute/{proposalId}", "/api/trust-score/recalculate/{proposalId}"})
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<StartupTrustScore> recomputeTrustScore(@PathVariable Integer proposalId) {
        StartupTrustScore score = trustScoreService.computeTrustScore(proposalId);
        return ResponseEntity.ok(score);
    }

    @GetMapping("/api/trust/all")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<List<TrustScoreResponse>> getAllScores() {
        List<TrustScoreResponse> responses = trustScoreService.getAllScores();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/api/trust/investor")
    public ResponseEntity<InvestorTrustScoreResponse> getInvestorTrustScore() {
        Integer userId = getCurrentUserId();
        InvestorTrustScoreResponse response = trustScoreService.getInvestorTrustScore(userId);
        return ResponseEntity.ok(response);
    }
}
