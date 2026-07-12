package com.innovaura.modules.notification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "UserId", nullable = false)
    private Integer userId;

    @Column(name = "Title", nullable = false, length = 150)
    private String title;

    @Column(name = "Message", nullable = false, columnDefinition = "LONGTEXT")
    private String message;

    @Column(name = "IsRead", nullable = false)
    private Boolean isRead;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (isRead == null) isRead = false;
    }
}
