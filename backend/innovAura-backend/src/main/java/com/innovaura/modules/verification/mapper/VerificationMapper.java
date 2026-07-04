package com.innovaura.modules.verification.mapper;

import com.innovaura.modules.verification.dto.FounderVerificationResponse;
import com.innovaura.modules.verification.dto.StartupVerificationResponse;
import com.innovaura.modules.verification.entity.FounderVerification;
import com.innovaura.modules.verification.entity.StartupVerification;
import org.springframework.stereotype.Component;

@Component
public class VerificationMapper {

    public FounderVerificationResponse toFounderResponse(FounderVerification fv) {
        if (fv == null) return null;
        return FounderVerificationResponse.builder()
                .id(fv.getId())
                .userId(fv.getUserId())
                .verificationLevel(fv.getVerificationLevel())
                .emailVerified(fv.getEmailVerified())
                .mobileVerified(fv.getMobileVerified())
                .panVerified(fv.getPanVerified())
                .panNumber(fv.getPanNumber())
                .aadhaarVerified(fv.getAadhaarVerified())
                .aadhaarNumber(fv.getAadhaarNumber())
                .linkedInVerified(fv.getLinkedInVerified())
                .linkedInUrl(fv.getLinkedInUrl())
                .gstVerified(fv.getGstVerified())
                .gstNumber(fv.getGstNumber())
                .companyRegVerified(fv.getCompanyRegVerified())
                .registrationNumber(fv.getRegistrationNumber())
                .cinVerified(fv.getCinVerified())
                .cinNumber(fv.getCinNumber())
                .documentUrl(fv.getDocumentUrl())
                .status(fv.getStatus())
                .checkedById(fv.getCheckedById())
                .checkedAt(fv.getCheckedAt())
                .notes(fv.getNotes())
                .build();
    }

    public StartupVerificationResponse toStartupResponse(StartupVerification sv) {
        if (sv == null) return null;
        return StartupVerificationResponse.builder()
                .id(sv.getId())
                .startupId(sv.getStartupId())
                .registrationCertificateStatus(sv.getRegistrationCertificateStatus())
                .registrationCertificateUrl(sv.getRegistrationCertificateUrl())
                .gstDocumentStatus(sv.getGstDocumentStatus())
                .gstDocumentUrl(sv.getGstDocumentUrl())
                .panDocumentStatus(sv.getPanDocumentStatus())
                .panDocumentUrl(sv.getPanDocumentUrl())
                .financialStatementsStatus(sv.getFinancialStatementsStatus())
                .financialStatementsUrl(sv.getFinancialStatementsUrl())
                .pitchDeckStatus(sv.getPitchDeckStatus())
                .pitchDeckUrl(sv.getPitchDeckUrl())
                .overallStatus(sv.getOverallStatus())
                .verifiedById(sv.getVerifiedById())
                .verifiedAt(sv.getVerifiedAt())
                .notes(sv.getNotes())
                .build();
    }
}
