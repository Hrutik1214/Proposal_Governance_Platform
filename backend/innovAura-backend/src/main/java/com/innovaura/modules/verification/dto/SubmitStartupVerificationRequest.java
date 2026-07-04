package com.innovaura.modules.verification.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitStartupVerificationRequest {

    @NotNull(message = "Startup ID is required.")
    private Integer startupId;

    private String registrationCertificateUrl;
    private String gstDocumentUrl;
    private String panDocumentUrl;
    private String financialStatementsUrl;
    private String pitchDeckUrl;
    private String notes;
}
