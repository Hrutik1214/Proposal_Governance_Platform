package com.innovaura.modules.verification.entity;

import com.innovaura.modules.auth.entity.User;
import com.innovaura.modules.proposal.entity.Proposal;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "StartupVerifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StartupVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "StartupId", nullable = false)
    private Integer startupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StartupId", insertable = false, updatable = false)
    private Proposal startup;

    @Column(name = "RegistrationCertificateStatus", length = 20)
    private String registrationCertificateStatus;

    @Column(name = "RegistrationCertificateUrl", length = 500)
    private String registrationCertificateUrl;

    @Column(name = "GstDocumentStatus", length = 20)
    private String gstDocumentStatus;

    @Column(name = "GstDocumentUrl", length = 500)
    private String gstDocumentUrl;

    @Column(name = "PanDocumentStatus", length = 20)
    private String panDocumentStatus;

    @Column(name = "PanDocumentUrl", length = 500)
    private String panDocumentUrl;

    @Column(name = "FinancialStatementsStatus", length = 20)
    private String financialStatementsStatus;

    @Column(name = "FinancialStatementsUrl", length = 500)
    private String financialStatementsUrl;

    @Column(name = "PitchDeckStatus", length = 20)
    private String pitchDeckStatus;

    @Column(name = "PitchDeckUrl", length = 500)
    private String pitchDeckUrl;

    @Column(name = "OverallStatus", nullable = false, length = 20)
    private String overallStatus;

    @Column(name = "VerifiedById")
    private Integer verifiedById;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VerifiedById", insertable = false, updatable = false)
    private User verifiedBy;

    @Column(name = "VerifiedAt")
    private LocalDateTime verifiedAt;

    @Column(name = "Notes", columnDefinition = "LONGTEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (overallStatus == null) overallStatus = "Pending";
        if (registrationCertificateStatus == null) registrationCertificateStatus = "Pending";
        if (gstDocumentStatus == null) gstDocumentStatus = "Pending";
        if (panDocumentStatus == null) panDocumentStatus = "Pending";
        if (financialStatementsStatus == null) financialStatementsStatus = "Pending";
        if (pitchDeckStatus == null) pitchDeckStatus = "Pending";
    }
}
