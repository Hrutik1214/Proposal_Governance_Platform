package com.innovaura.modules.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.innovaura.exception.NotFoundException;
import com.innovaura.modules.ai.dto.*;
import com.innovaura.modules.ai.entity.AiAssistantLog;
import com.innovaura.modules.ai.mapper.AiMapper;
import com.innovaura.modules.ai.repository.AiAssistantLogRepository;
import com.innovaura.modules.proposal.entity.Proposal;
import com.innovaura.modules.proposal.repository.ProposalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

    @Autowired
    private AiAssistantLogRepository aiAssistantLogRepository;

    @Autowired
    private ProposalRepository proposalRepository;

    @Autowired
    private AiMapper aiMapper;

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    private static final String GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public AiChatResponse founderChat(AiChatRequest request, Integer userId, String role) {
        List<Proposal> proposals = proposalRepository.findBySubmitterId(userId);

        String systemPrompt = "You are an expert AI Startup Advisor helping a founder on InnovAura, a proposal governance platform.\n" +
                "Proposals owned by founder: " + proposals.stream().map(Proposal::getTitle).collect(Collectors.joining(", ")) + "\n" +
                "Be specific, actionable, and professional. Max 600 words.";

        String responseText = callGeminiOrFallback(systemPrompt, request.getPrompt());

        logAiInteraction(userId, role != null ? role : "Submitter", request.getPrompt(), responseText);

        return AiChatResponse.builder()
                .response(responseText)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional
    public AiChatResponse investorChat(AiChatRequest request, Integer userId, String role) {
        List<Proposal> topProposals = proposalRepository.findByStatusNot("Draft").stream().limit(5).collect(Collectors.toList());

        String systemPrompt = "You are an expert AI Investment Analyst on InnovAura platform.\n" +
                "Active proposals: " + topProposals.stream().map(p -> p.getTitle() + " (" + p.getRequestedAmount() + ")").collect(Collectors.joining(", ")) + "\n" +
                "Give specific investment insights. Max 600 words.";

        String responseText = callGeminiOrFallback(systemPrompt, request.getPrompt());

        logAiInteraction(userId, role != null ? role : "Investor", request.getPrompt(), responseText);

        return AiChatResponse.builder()
                .response(responseText)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional(readOnly = true)
    public PagedAiLogResponse getLogs(int page, int pageSize) {
        int currentPage = page <= 0 ? 0 : page - 1;
        int effectivePageSize = pageSize <= 0 ? 50 : pageSize;

        Page<AiAssistantLog> logPage = aiAssistantLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(currentPage, effectivePageSize));

        List<AiLogResponse> logs = logPage.getContent().stream()
                .map(aiMapper::toLogResponse)
                .collect(Collectors.toList());

        return PagedAiLogResponse.builder()
                .total(logPage.getTotalElements())
                .page(currentPage + 1)
                .pageSize(effectivePageSize)
                .logs(logs)
                .build();
    }

    @Transactional(readOnly = true)
    public AiAnalysisResponse analyzeProposal(Integer proposalId) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new NotFoundException("Proposal not found with id: " + proposalId));

        return AiAnalysisResponse.builder()
                .proposalId(proposalId)
                .title(proposal.getTitle())
                .executiveSummary("AI Analysis for '" + proposal.getTitle() + "' in " + proposal.getDepartment() + " department.")
                .feasibilityRating(8)
                .riskRating(3)
                .marketPotentialRating(9)
                .keyStrengths(List.of("Strong team background", "Clear market demand", "Defensible business model"))
                .keyRisks(List.of("Early stage customer adoption risk", "Regulatory compliance requirements"))
                .recommendations(List.of("Proceed to reviewer assignment", "Verify financial statements"))
                .build();
    }

    @Transactional(readOnly = true)
    public PatentAnalysisResponse analyzePatent(String patentId) {
        return PatentAnalysisResponse.builder()
                .patentId(patentId)
                .patentTitle("Patent Analysis for ID " + patentId)
                .noveltyAssessment("High Novelty Score (8.5/10)")
                .claimStrength("Strong independent claims with clear industrial applicability")
                .similarPatentsFound(List.of("US9812345B2", "EP3456789A1"))
                .overallRisk("Low IP Infringement Risk")
                .build();
    }

    private String callGeminiOrFallback(String systemPrompt, String userPrompt) {
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                String url = GEMINI_ENDPOINT + "?key=" + geminiApiKey;

                Map<String, Object> payload = new HashMap<>();
                Map<String, Object> contentMap = new HashMap<>();
                contentMap.put("role", "user");
                contentMap.put("parts", List.of(Map.of("text", systemPrompt + "\n\nUser Question: " + userPrompt)));
                payload.put("contents", List.of(contentMap));

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(payload), headers);
                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Map<?, ?> root = objectMapper.readValue(response.getBody(), Map.class);
                    List<?> candidates = (List<?>) root.get("candidates");
                    if (candidates != null && !candidates.isEmpty()) {
                        Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
                        Map<?, ?> content = (Map<?, ?>) candidate.get("content");
                        List<?> parts = (List<?>) content.get("parts");
                        Map<?, ?> part = (Map<?, ?>) parts.get(0);
                        return (String) part.get("text");
                    }
                }
            } catch (Exception e) {
                System.err.println("[AiService] Gemini API call failed, using fallback: " + e.getMessage());
            }
        }
        return generateFallbackResponse(userPrompt);
    }

    private String generateFallbackResponse(String prompt) {
        String p = prompt.toLowerCase().trim();

        if (p.contains("startup idea") || p.contains("business idea") || p.contains("suggest idea")) {
            return "**🚀 High-Potential Startup Ideas for 2026**\n\n" +
                    "**1. AI-Powered Legal Assistant for SMEs**\n" +
                    "Draft contracts, compliance checklists, and legal notices automatically. Target: 60M+ Indian SMEs without legal teams.\n\n" +
                    "**2. Rural Agri-Fintech Platform**\n" +
                    "Micro-credit + crop insurance + market price discovery for farmers via WhatsApp/USSD.\n\n" +
                    "**3. B2B SaaS for MSME Compliance**\n" +
                    "Automate GST, TDS, EPF, ESI filings. Subscription model, recurring revenue.\n\n" +
                    "Which sector interests you most? I can deep-dive into any of these.";
        }

        if (p.contains("fund") || p.contains("raise") || p.contains("capital") || p.contains("investment")) {
            return "**💰 Fundraising Strategy Guide**\n\n" +
                    "**Stage 1 – Pre-Seed (₹10L–₹50L)**\n" +
                    "- Sources: Friends & Family, Angel Networks, Govt schemes (Startup India Seed Fund)\n\n" +
                    "**Stage 2 – Seed Round (₹50L–₹3Cr)**\n" +
                    "- Sources: Marquee angels, micro-VCs\n\n" +
                    "**Stage 3 – Series A (₹5Cr–₹30Cr)**\n" +
                    "- Sources: Institutional VCs\n\n" +
                    "**📋 Immediate Action Items:**\n" +
                    "1. Build a 10-slide pitch deck\n" +
                    "2. Create a data room with financials & cap table\n" +
                    "3. Update your proposal on InnovAura platform to boost Trust Score";
        }

        return "**🤖 AI Advisor — InnovAura Assistant Ready!**\n\n" +
                "I can assist you with:\n" +
                "1. Startup Ideas & Market Evaluation\n" +
                "2. Pitch Deck & Proposal Improvement\n" +
                "3. Fundraising & Investor Strategy\n" +
                "4. Business Model & Unit Economics\n" +
                "5. Legal & Compliance Roadmap\n\n" +
                "Type your specific question to get actionable insights!";
    }

    private void logAiInteraction(Integer userId, String role, String prompt, String responseText) {
        try {
            AiAssistantLog log = AiAssistantLog.builder()
                    .userId(userId)
                    .userRole(role)
                    .prompt(prompt.length() > 2000 ? prompt.substring(0, 2000) : prompt)
                    .responseSummary(responseText.length() > 500 ? responseText.substring(0, 500) : responseText)
                    .build();
            aiAssistantLogRepository.save(log);
        } catch (Exception e) {
            // Ignore non-critical log failures
        }
    }
}
