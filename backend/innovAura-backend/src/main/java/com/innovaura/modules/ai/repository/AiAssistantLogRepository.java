package com.innovaura.modules.ai.repository;

import com.innovaura.modules.ai.entity.AiAssistantLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiAssistantLogRepository extends JpaRepository<AiAssistantLog, Integer> {

    List<AiAssistantLog> findByUserId(Integer userId);

    Page<AiAssistantLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
