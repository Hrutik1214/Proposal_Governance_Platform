package com.innovaura.modules.ai.mapper;

import com.innovaura.modules.ai.dto.AiLogResponse;
import com.innovaura.modules.ai.entity.AiAssistantLog;
import org.springframework.stereotype.Component;

@Component
public class AiMapper {

    public AiLogResponse toLogResponse(AiAssistantLog log) {
        if (log == null) return null;

        String userName = log.getUser() != null && log.getUser().getFullName() != null ?
                log.getUser().getFullName() : "User";

        String summary = log.getResponseSummary();
        if (summary != null && summary.length() > 150) {
            summary = summary.substring(0, 150) + "...";
        }

        return AiLogResponse.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .userName(userName)
                .userRole(log.getUserRole())
                .prompt(log.getPrompt())
                .responseSummary(summary)
                .createdAt(log.getCreatedAt())
                .build();
    }
}
