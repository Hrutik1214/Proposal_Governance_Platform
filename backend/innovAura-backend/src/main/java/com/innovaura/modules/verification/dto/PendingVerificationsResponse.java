package com.innovaura.modules.verification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingVerificationsResponse {

    private List<FounderVerificationResponse> founders;
    private List<StartupVerificationResponse> startups;
}
