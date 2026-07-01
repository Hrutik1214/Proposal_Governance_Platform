package com.innovaura.modules.review.entity;

import com.innovaura.modules.auth.entity.User;
import com.innovaura.modules.proposal.entity.Proposal;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "DueDiligenceReports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DueDiligenceReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "StartupId", nullable = false)
    private Integer startupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StartupId", insertable = false, updatable = false)
    private Proposal startup;

    @Column(name = "ReviewerId", nullable = false)
    private Integer reviewerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ReviewerId", insertable = false, updatable = false)
    private User reviewer;

    @Column(name = "InnovationScore", nullable = false)
    private Integer innovationScore;

    @Column(name = "MarketPotentialScore", nullable = false)
    private Integer marketPotentialScore;

    @Column(name = "FeasibilityScore", nullable = false)
    private Integer feasibilityScore;

    @Column(name = "TeamStrengthScore", nullable = false)
    private Integer teamStrengthScore;

    @Column(name = "FinancialReadinessScore", nullable = false)
    private Integer financialReadinessScore;

    @Column(name = "RiskAssessmentScore", nullable = false)
    private Integer riskAssessmentScore;

    @Column(name = "PatentStrengthScore", nullable = false)
    private Integer patentStrengthScore;

    @Column(name = "IpStrengthScore", nullable = false)
    private Integer ipStrengthScore;

    @Column(name = "Summary", nullable = false, columnDefinition = "LONGTEXT")
    private String summary;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
