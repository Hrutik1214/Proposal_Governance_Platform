package com.innovaura.modules.admin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "AuditLogs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "UserId")
    private Integer userId;

    @Column(name = "Username", length = 100)
    private String username;

    @Column(name = "Action", nullable = false, length = 100)
    private String action;

    @Column(name = "EntityName", length = 100)
    private String entityName;

    @Column(name = "EntityId")
    private Integer entityId;

    @Column(name = "Details", columnDefinition = "LONGTEXT")
    private String details;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "IpAddress", length = 45)
    private String ipAddress;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
