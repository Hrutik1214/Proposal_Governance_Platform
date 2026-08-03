package com.innovaura.logging;

public interface AuditLogger {

    void logAction(String userId, String action, String entityName, String entityId, String details);

    void logSecurityEvent(String username, String eventType, String ipAddress, String status);
}
