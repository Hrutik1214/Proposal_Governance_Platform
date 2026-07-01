package com.innovaura.modules.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private Integer id;
    private Integer proposalId;
    private Integer reviewerId;
    private String reviewerName;
    private int feasibilityScore;
    private int strategicScore;
    private int riskScore;
    private int roiScore;
    private String comment;
    private double averageScore;
    private LocalDateTime submittedAt;
}
