package com.innovaura.modules.trust.mapper;

import com.innovaura.modules.trust.dto.TrustScoreResponse;
import com.innovaura.modules.trust.entity.StartupTrustScore;
import org.springframework.stereotype.Component;

@Component
public class TrustScoreMapper {

    public TrustScoreResponse toResponse(StartupTrustScore score) {
        if (score == null) return null;

        String startupName = score.getStartup() != null ? score.getStartup().getStartupName() : "";
        String proposalTitle = score.getStartup() != null ? score.getStartup().getTitle() : "";

        return TrustScoreResponse.builder()
                .id(score.getId())
                .startupId(score.getStartupId())
                .startupName(startupName)
                .proposalTitle(proposalTitle)
                .trustScore(score.getTrustScore())
                .trustLevel(score.getTrustLevel())
                .lastUpdated(score.getLastUpdated())
                .breakdownJson(score.getBreakdownJson())
                .build();
    }
}
