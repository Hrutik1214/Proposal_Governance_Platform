package com.innovaura.modules.verification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartupVerificationResponse {

    private Integer id;
    private Integer startupId;
    private String registrationCertificateStatus;
    private String registrationCertificateUrl;
    private String gstDocumentStatus;
    private String gstDocumentUrl;
    private String panDocumentStatus;
    private String panDocumentUrl;
    private String financialStatementsStatus;
    private String financialStatementsUrl;
    private String pitchDeckStatus;
    private String pitchDeckUrl;
    private String overallStatus;
    private Integer verifiedById;
    private LocalDateTime verifiedAt;
    private String notes;
}
