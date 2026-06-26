package com.innovaura.modules.proposal.repository;

import com.innovaura.modules.proposal.entity.Proposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProposalRepository extends JpaRepository<Proposal, Integer>, JpaSpecificationExecutor<Proposal> {

    List<Proposal> findBySubmitterId(Integer submitterId);

    List<Proposal> findByStatusNot(String status);

    List<Proposal> findByDepartment(String department);

    List<Proposal> findByDepartmentAndStatus(String department, String status);

    List<Proposal> findBySubmitterIdAndStatusNot(Integer submitterId, String status);
}
