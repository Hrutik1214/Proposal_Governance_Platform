package com.innovaura.modules.verification.entity;

import com.innovaura.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "FounderVerifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FounderVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "UserId", nullable = false)
    private Integer userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId", insertable = false, updatable = false)
    private User user;

    @Column(name = "VerificationLevel", nullable = false, length = 20)
    private String verificationLevel;

    @Column(name = "EmailVerified", nullable = false)
    private Boolean emailVerified;

    @Column(name = "MobileVerified", nullable = false)
    private Boolean mobileVerified;

    @Column(name = "PanVerified", nullable = false)
    private Boolean panVerified;

    @Column(name = "PanNumber", length = 20)
    private String panNumber;

    @Column(name = "AadhaarVerified", nullable = false)
    private Boolean aadhaarVerified;

    @Column(name = "AadhaarNumber", length = 20)
    private String aadhaarNumber;

    @Column(name = "LinkedInVerified", nullable = false)
    private Boolean linkedInVerified;

    @Column(name = "LinkedInUrl", length = 500)
    private String linkedInUrl;

    @Column(name = "GstVerified", nullable = false)
    private Boolean gstVerified;

    @Column(name = "GstNumber", length = 20)
    private String gstNumber;

    @Column(name = "CompanyRegVerified", nullable = false)
    private Boolean companyRegVerified;

    @Column(name = "RegistrationNumber", length = 100)
    private String registrationNumber;

    @Column(name = "CinVerified", nullable = false)
    private Boolean cinVerified;

    @Column(name = "CinNumber", length = 30)
    private String cinNumber;

    @Column(name = "DocumentUrl", length = 500)
    private String documentUrl;

    @Column(name = "Status", nullable = false, length = 20)
    private String status;

    @Column(name = "CheckedById")
    private Integer checkedById;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CheckedById", insertable = false, updatable = false)
    private User checkedBy;

    @Column(name = "CheckedAt")
    private LocalDateTime checkedAt;

    @Column(name = "Notes", columnDefinition = "LONGTEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (verificationLevel == null) verificationLevel = "Basic";
        if (status == null) status = "Pending";
        if (emailVerified == null) emailVerified = false;
        if (mobileVerified == null) mobileVerified = false;
        if (panVerified == null) panVerified = false;
        if (aadhaarVerified == null) aadhaarVerified = false;
        if (linkedInVerified == null) linkedInVerified = false;
        if (gstVerified == null) gstVerified = false;
        if (companyRegVerified == null) companyRegVerified = false;
        if (cinVerified == null) cinVerified = false;
    }
}
