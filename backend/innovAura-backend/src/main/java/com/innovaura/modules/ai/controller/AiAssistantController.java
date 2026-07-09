package com.innovaura.modules.ai.controller;

import com.innovaura.modules.ai.dto.*;
import com.innovaura.modules.ai.service.AiService;
import com.innovaura.modules.auth.entity.User;
import com.innovaura.modules.auth.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai-assistant")
public class AiAssistantController {

    @Autowired
    private AiService aiService;

    @Autowired
    private UserRepository userRepository;

    private Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        return user != null ? user.getId() : 0;
    }

    private String getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        return user != null ? user.getRole() : "User";
    }

    @PostMapping("/founder")
    public ResponseEntity<AiChatResponse> founderChat(@Valid @RequestBody AiChatRequest request) {
        Integer userId = getCurrentUserId();
        String role = getCurrentUserRole();
        AiChatResponse response = aiService.founderChat(request, userId, role);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/investor")
    public ResponseEntity<AiChatResponse> investorChat(@Valid @RequestBody AiChatRequest request) {
        Integer userId = getCurrentUserId();
        String role = getCurrentUserRole();
        AiChatResponse response = aiService.investorChat(request, userId, role);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/logs")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<PagedAiLogResponse> getLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int pageSize
    ) {
        PagedAiLogResponse response = aiService.getLogs(page, pageSize);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/analyze/{proposalId}")
    public ResponseEntity<AiAnalysisResponse> analyzeProposal(@PathVariable Integer proposalId) {
        AiAnalysisResponse response = aiService.analyzeProposal(proposalId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/patent/{patentId}")
    public ResponseEntity<PatentAnalysisResponse> analyzePatent(@PathVariable String patentId) {
        PatentAnalysisResponse response = aiService.analyzePatent(patentId);
        return ResponseEntity.ok(response);
    }
}
