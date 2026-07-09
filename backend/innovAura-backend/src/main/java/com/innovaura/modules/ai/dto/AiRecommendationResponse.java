package com.innovaura.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiRecommendationResponse {

    private Integer userId;
    private String role;
    private List<String> recommendedActions;
    private List<Integer> recommendedProposalIds;
    private String summary;
}
