package com.innovaura.modules.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceDetailResponse {

    private Integer id;
    private String title;
    private String description;
    private String department;
    private BigDecimal requestedAmount;
    private BigDecimal approvedAmount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String startupName;
    private String problemStatement;
    private String proposedStatement;
    private BigDecimal equityOffered;
    private String businessModel;
    private String teamDetails;
    private String demoVideoUrl;
    private String industry;
    private String category;
    private SubmitterDTO submitter;
    private int likeCount;
    private boolean hasLiked;
    private int commentCount;
    private int interestCount;
    private boolean hasInterested;
}
