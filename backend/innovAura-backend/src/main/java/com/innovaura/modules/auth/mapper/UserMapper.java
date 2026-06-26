package com.innovaura.modules.auth.mapper;

import com.innovaura.modules.auth.dto.LoginResponse;
import com.innovaura.modules.auth.dto.UserResponse;
import com.innovaura.modules.auth.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toUserResponse(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .contactNumber(user.getContactNumber())
                .department(user.getDepartment())
                .patentId(user.getPatentId())
                .patentVerificationStatus(user.getPatentVerificationStatus())
                .patentDetailsJson(user.getPatentDetailsJson())
                .build();
    }

    public LoginResponse toLoginResponse(User user, String token) {
        if (user == null) return null;
        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .contactNumber(user.getContactNumber())
                .department(user.getDepartment())
                .patentId(user.getPatentId())
                .patentVerificationStatus(user.getPatentVerificationStatus())
                .patentDetailsJson(user.getPatentDetailsJson())
                .build();
    }
}
