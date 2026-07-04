package com.innovaura.modules.verification.repository;

import com.innovaura.modules.verification.entity.StartupVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StartupVerificationRepository extends JpaRepository<StartupVerification, Integer> {

    Optional<StartupVerification> findByStartupId(Integer startupId);

    List<StartupVerification> findByOverallStatus(String status);
}
