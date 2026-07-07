package com.innovaura.modules.trust.repository;

import com.innovaura.modules.trust.entity.StartupTrustScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrustScoreRepository extends JpaRepository<StartupTrustScore, Integer> {

    Optional<StartupTrustScore> findByStartupId(Integer startupId);
}
