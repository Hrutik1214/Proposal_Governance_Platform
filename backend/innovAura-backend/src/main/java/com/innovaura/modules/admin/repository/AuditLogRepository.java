package com.innovaura.modules.admin.repository;

import com.innovaura.modules.admin.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Integer> {

    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<AuditLog> findByEntityNameAndEntityId(String entityName, Integer entityId);
}
