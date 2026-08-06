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
    @jakarta.validation.constraints.Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "Username can only contain letters, numbers, underscores, and hyphens")
    @JsonAlias({"Username", "username"})
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 64, message = "Password must be at least 8 characters")
    @jakarta.validation.constraints.Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$", message = "Password must contain at least one uppercase, one lowercase, one number, and one special character")
    @JsonAlias({"Password", "password"})
    private String password;

    @NotBlank(message = "Role is required")
    @jakarta.validation.constraints.Pattern(regexp = "^(Admin|Reviewer|Founder|Investor)$", message = "Invalid Role")
    @JsonAlias({"Role", "role"})
    private String role; // "Admin", "Reviewer", "Founder", "Investor"

    @NotBlank(message = "Full Name is required")
    @Size(min = 2, max = 100, message = "Full Name must be between 2 and 100 characters")
    @JsonAlias({"FullName", "fullName"})
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "Please provide a valid enterprise email address")
    @JsonAlias({"Email", "email"})
    private String email;

    @NotBlank(message = "Contact Number is required")
    @jakarta.validation.constraints.Pattern(regexp = "^(?:\\+91[\\s-]?)?[6789]\\d{9}$", message = "Invalid Indian mobile number format")
    @JsonAlias({"ContactNumber", "contactNumber"})
    private String contactNumber;

    @NotBlank(message = "Department is required")
    @JsonAlias({"Department", "department"})
    private String department;

    @com.innovaura.common.validation.ValidPatentId
    @JsonAlias({"PatentId", "patentId"})
    private String patentId;
}
