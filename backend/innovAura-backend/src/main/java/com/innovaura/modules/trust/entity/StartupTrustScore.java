package com.innovaura.modules.trust.entity;

import com.innovaura.modules.proposal.entity.Proposal;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "StartupTrustScores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StartupTrustScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "StartupId", nullable = false)
    private Integer startupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StartupId", insertable = false, updatable = false)
    private Proposal startup;

    @Column(name = "TrustScore", nullable = false)
    private Integer trustScore;

    @Column(name = "TrustLevel", nullable = false, length = 20)
    private String trustLevel;

    @Column(name = "LastUpdated", nullable = false)
    private LocalDateTime lastUpdated;

    @Column(name = "BreakdownJson", columnDefinition = "LONGTEXT")
    private String breakdownJson;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        if (lastUpdated == null) lastUpdated = LocalDateTime.now();
        if (trustLevel == null) trustLevel = "Moderate";
    }
}
