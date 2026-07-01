package com.innovaura.modules.review.repository;

import com.innovaura.modules.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    List<Review> findByProposalId(Integer proposalId);

    List<Review> findByReviewerId(Integer reviewerId);

    Optional<Review> findByProposalIdAndReviewerId(Integer proposalId, Integer reviewerId);

    boolean existsByProposalIdAndReviewerId(Integer proposalId, Integer reviewerId);
}
