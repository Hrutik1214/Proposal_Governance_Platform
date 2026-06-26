package com.innovaura.modules.auth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @JsonAlias({"Username", "username"})
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @JsonAlias({"Password", "password"})
    private String password;

    @JsonAlias({"Role", "role"})
    private String role; // "Admin", "Reviewer", "Founder", "Investor"

    @NotBlank(message = "Full Name is required")
    @Size(min = 2, message = "Full Name must be at least 2 characters")
    @JsonAlias({"FullName", "fullName"})
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @JsonAlias({"Email", "email"})
    private String email;

    @NotBlank(message = "Contact Number is required")
    @JsonAlias({"ContactNumber", "contactNumber"})
    private String contactNumber;

    @NotBlank(message = "Department is required")
    @JsonAlias({"Department", "department"})
    private String department;

    @JsonAlias({"PatentId", "patentId"})
    private String patentId;
}
