package com.innovaura.modules.review.controller;

import com.innovaura.modules.auth.entity.User;
import com.innovaura.modules.auth.repository.UserRepository;
import com.innovaura.modules.review.dto.ReviewRequest;
import com.innovaura.modules.review.dto.ReviewResponse;
import com.innovaura.modules.review.dto.ReviewSummary;
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
@RequestMapping("/api/reviews")
public class ReviewsController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    private Integer getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = auth != null ? userRepository.findByUsername(auth.getName()).orElse(null) : null;
        return user != null ? user.getId() : 0;
    }

    @PostMapping
    @PreAuthorize("hasRole('Reviewer')")
    public ResponseEntity<ReviewResponse> submitReview(@Valid @RequestBody ReviewRequest request) {
        Integer reviewerId = getCurrentUserId();
        ReviewResponse response = reviewService.submitReview(request, reviewerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/proposal/{proposalId}")
    public ResponseEntity<List<ReviewResponse>> getByProposal(@PathVariable Integer proposalId) {
        List<ReviewResponse> responses = reviewService.getReviewsByProposalId(proposalId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('Reviewer')")
    public ResponseEntity<List<ReviewResponse>> getMyReviews() {
        Integer reviewerId = getCurrentUserId();
        List<ReviewResponse> responses = reviewService.getMyReviews(reviewerId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/proposal/{proposalId}/summary")
    public ResponseEntity<ReviewSummary> getReviewSummary(@PathVariable Integer proposalId) {
        ReviewSummary summary = reviewService.calculateAverageScore(proposalId);
        return ResponseEntity.ok(summary);
    }
}
