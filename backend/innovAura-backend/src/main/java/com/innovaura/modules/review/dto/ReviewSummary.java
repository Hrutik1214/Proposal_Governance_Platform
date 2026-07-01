package com.innovaura.modules.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSummary {

    private Integer proposalId;
    private int reviewCount;
    private double averageFeasibility;
    private double averageStrategic;
    private double averageRisk;
    private double averageRoi;
    private double overallAverageScore;
}
