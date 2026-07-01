package com.innovaura.modules.review.repository;

import com.innovaura.modules.review.entity.DueDiligenceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DueDiligenceRepository extends JpaRepository<DueDiligenceReport, Integer> {

    List<DueDiligenceReport> findByStartupIdOrderByCreatedAtDesc(Integer startupId);

    Optional<DueDiligenceReport> findFirstByStartupIdOrderByCreatedAtDesc(Integer startupId);
}
