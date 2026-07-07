package com.innovaura.modules.trust.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrustScoreResponse {

    private Integer id;
    private Integer startupId;
    private String startupName;
    private String proposalTitle;
    private int trustScore;
    private String trustLevel;
    private LocalDateTime lastUpdated;
    private String breakdownJson;
}
