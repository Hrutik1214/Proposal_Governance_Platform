package com.innovaura.modules.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitterDTO {

    private Integer submitterId;
    private String fullName;
    private String role;
    private String department;
    private String patentVerificationStatus;
    private String patentId;
}
