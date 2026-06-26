package com.innovaura.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Integer id;
    private String username;
    private String role;
    private String fullName;
    private String email;
    private String contactNumber;
    private String department;
    private String patentId;
    private String patentVerificationStatus;
    private String patentDetailsJson;
}
