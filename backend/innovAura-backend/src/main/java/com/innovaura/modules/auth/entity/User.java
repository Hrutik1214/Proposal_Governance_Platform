package com.innovaura.modules.auth.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "Username", nullable = false, length = 100, unique = true)
    private String username;

    @Column(name = "PasswordHash", nullable = false)
    private String passwordHash;

    @Column(name = "Role", nullable = false, length = 50)
    private String role;

    @Column(name = "FullName", nullable = false, length = 100)
    private String fullName;

    @Column(name = "Email", nullable = false, length = 150)
    private String email;

    @Column(name = "ContactNumber", length = 20)
    private String contactNumber;

    @Column(name = "Department", nullable = false, length = 100)
    private String department;

    @Column(name = "PatentId", length = 100)
    private String patentId;

    @Column(name = "PatentVerificationStatus", length = 50)
    private String patentVerificationStatus;

    @Column(name = "PatentDetailsJson", columnDefinition = "LONGTEXT")
    private String patentDetailsJson;
}
