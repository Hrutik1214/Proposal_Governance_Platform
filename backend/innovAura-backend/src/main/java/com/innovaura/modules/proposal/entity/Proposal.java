package com.innovaura.modules.proposal.entity;

import com.innovaura.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Proposals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Proposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "Title", nullable = false, length = 200)
    private String title;

    @Column(name = "Description", nullable = false, columnDefinition = "LONGTEXT")
    private String description;

    @Column(name = "Department", nullable = false, length = 100)
    private String department;

    @Column(name = "RequestedAmount", nullable = false, precision = 18, scale = 2)
    private BigDecimal requestedAmount;

    @Column(name = "ApprovedAmount", precision = 18, scale = 2)
    private BigDecimal approvedAmount;

    @Column(name = "Status", nullable = false, length = 50)
    private String status;

    @Column(name = "StartupName", nullable = false, length = 100)
    private String startupName;

    @Column(name = "ProblemStatement", nullable = false, columnDefinition = "LONGTEXT")
    private String problemStatement;

    @Column(name = "ProposedStatement", nullable = false, columnDefinition = "LONGTEXT")
    private String proposedStatement;

    @Column(name = "EquityOffered", nullable = false, precision = 18, scale = 2)
    private BigDecimal equityOffered;

    @Column(name = "BusinessModel", columnDefinition = "LONGTEXT")
    private String businessModel;

    @Column(name = "Industry", length = 100)
    private String industry;

    @Column(name = "Category", length = 100)
    private String category;

    @Column(name = "TeamDetails", nullable = false, columnDefinition = "LONGTEXT")
    private String teamDetails;

    @Column(name = "DemoVideoUrl", length = 500)
    private String demoVideoUrl;

    @Column(name = "SubmitterId", nullable = false)
    private Integer submitterId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SubmitterId", insertable = false, updatable = false)
    private User submitter;

    @Column(name = "SupportingDocumentPath", length = 500)
    private String supportingDocumentPath;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (status == null) status = "Draft";
        if (approvedAmount == null) approvedAmount = BigDecimal.ZERO;
        if (supportingDocumentPath == null) supportingDocumentPath = "";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
