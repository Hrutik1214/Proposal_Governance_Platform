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
public class PagedAiLogResponse {

    private long total;
    private int page;
    private int pageSize;
    private List<AiLogResponse> logs;
}
