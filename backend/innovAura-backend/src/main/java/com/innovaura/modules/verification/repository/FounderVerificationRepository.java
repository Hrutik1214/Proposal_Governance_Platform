package com.innovaura.modules.verification.repository;

import com.innovaura.modules.verification.entity.FounderVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FounderVerificationRepository extends JpaRepository<FounderVerification, Integer> {

    Optional<FounderVerification> findByUserId(Integer userId);

    List<FounderVerification> findByStatus(String status);
}
