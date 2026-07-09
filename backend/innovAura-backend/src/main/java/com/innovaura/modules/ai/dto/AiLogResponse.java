package com.innovaura.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiLogResponse {

    private Integer id;
    private Integer userId;
    private String userName;
    private String userRole;
    private String prompt;
    private String responseSummary;
    private LocalDateTime createdAt;
}
