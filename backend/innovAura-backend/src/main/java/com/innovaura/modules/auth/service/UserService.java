package com.innovaura.modules.auth.service;

import com.innovaura.exception.NotFoundException;
import com.innovaura.exception.UnauthorizedException;
import com.innovaura.exception.ValidationException;
import com.innovaura.jwt.JwtTokenProvider;
import com.innovaura.modules.auth.dto.*;
import com.innovaura.modules.auth.entity.User;
import com.innovaura.modules.auth.mapper.UserMapper;
import com.innovaura.modules.auth.repository.UserRepository;
import com.innovaura.modules.auth.validation.AuthValidationUtils;
import com.innovaura.security.RoleConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Identity & User Management Service
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserMapper userMapper;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (request.getUsername() == null || !AuthValidationUtils.isValidUsername(request.getUsername())) {
            throw new ValidationException("Username must be 3-50 characters long and contain only letters, numbers, underscores, or hyphens.");
        }

        if (request.getEmail() == null || !AuthValidationUtils.isValidEmail(request.getEmail())) {
            throw new ValidationException("Please provide a valid email address.");
        }

        if (request.getFullName() == null || request.getFullName().trim().length() < 2) {
            throw new ValidationException("Full Name must be at least 2 characters long.");
        }

        if (request.getContactNumber() == null || !AuthValidationUtils.isValidContactNumber(request.getContactNumber())) {
            throw new ValidationException("Valid Contact Number (10-15 digits, e.g. +91 98123 45678) is required.");
        }

        String passwordError = AuthValidationUtils.validatePassword(request.getPassword());
        if (passwordError != null) {
            throw new ValidationException(passwordError);
        }

        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new ValidationException("Username is already taken.");
        }

        String role = request.getRole();
        if (!RoleConstants.ADMIN.equals(role) &&
            !RoleConstants.REVIEWER.equals(role) &&
            !RoleConstants.FOUNDER.equals(role) &&
            !RoleConstants.INVESTOR.equals(role)) {
            role = RoleConstants.FOUNDER;
        }

        String passwordHash = passwordEncoder.encode(request.getPassword());

        User newUser = User.builder()
                .username(request.getUsername().trim())
                .passwordHash(passwordHash)
                .role(role)
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim())
                .contactNumber(request.getContactNumber().trim())
                .department(request.getDepartment() != null ? request.getDepartment() : "General")
                .patentId(request.getPatentId())
                .patentVerificationStatus(request.getPatentId() != null && !request.getPatentId().isBlank() ? "Unverified" : null)
                .build();

        userRepository.save(newUser);

        return RegisterResponse.builder()
                .message("Registration successful.")
                .build();
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid username or password.");
        }

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("id", user.getId());
        extraClaims.put("role", user.getRole());
        extraClaims.put("email", user.getEmail());

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                user.getUsername(),
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );

        String token = jwtTokenProvider.generateToken(authentication, extraClaims);

        return userMapper.toLoginResponse(user, token);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found."));
        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found."));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail().trim());
        }
        if (request.getContactNumber() != null) {
            user.setContactNumber(request.getContactNumber().trim());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().trim());
        }

        userRepository.save(user);
        return userMapper.toUserResponse(user);
    }
}
