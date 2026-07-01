package com.innovaura.modules.review.entity;

import com.innovaura.modules.auth.entity.User;
import com.innovaura.modules.proposal.entity.Proposal;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "ProposalId", nullable = false)
    private Integer proposalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ProposalId", insertable = false, updatable = false)
    private Proposal proposal;

    @Column(name = "ReviewerId", nullable = false)
    private Integer reviewerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ReviewerId", insertable = false, updatable = false)
    private User reviewer;

    @Column(name = "FeasibilityScore", nullable = false)
    private Integer feasibilityScore;

    @Column(name = "StrategicScore", nullable = false)
    private Integer strategicScore;

    @Column(name = "RiskScore", nullable = false)
    private Integer riskScore;

    @Column(name = "RoiScore", nullable = false)
    private Integer roiScore;

    @Column(name = "Comment", nullable = false, columnDefinition = "LONGTEXT")
    private String comment;

    @Column(name = "SubmittedAt", nullable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        if (submittedAt == null) submittedAt = LocalDateTime.now();
    }
}
