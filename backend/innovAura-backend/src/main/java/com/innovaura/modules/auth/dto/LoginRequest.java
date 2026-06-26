package com.innovaura.modules.auth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Username is required")
    @JsonAlias({"Username", "username"})
    private String username;

    @NotBlank(message = "Password is required")
    @JsonAlias({"Password", "password"})
    private String password;
}
