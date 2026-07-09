package com.innovaura.modules.ai.entity;

import com.innovaura.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "AIAssistantLogs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAssistantLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "UserId", nullable = false)
    private Integer userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId", insertable = false, updatable = false)
    private User user;

    @Column(name = "UserRole", nullable = false, length = 50)
    private String userRole;

    @Column(name = "Prompt", nullable = false, columnDefinition = "LONGTEXT")
    private String prompt;

    @Column(name = "ResponseSummary", columnDefinition = "LONGTEXT")
    private String responseSummary;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
