package com.innovaura.modules.proposal.validation;

import com.innovaura.exception.ValidationException;
import com.innovaura.modules.proposal.entity.ProposalStatus;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Component
public class ProposalWorkflowValidator {

    private static final Map<ProposalStatus, Set<ProposalStatus>> ALLOWED_TRANSITIONS = new HashMap<>();

    static {
        ALLOWED_TRANSITIONS.put(ProposalStatus.DRAFT, EnumSet.of(ProposalStatus.SUBMITTED));
        ALLOWED_TRANSITIONS.put(ProposalStatus.SUBMITTED, EnumSet.of(ProposalStatus.UNDER_REVIEW));
        ALLOWED_TRANSITIONS.put(ProposalStatus.UNDER_REVIEW, EnumSet.of(ProposalStatus.REVIEWED, ProposalStatus.APPROVED, ProposalStatus.REJECTED));
        ALLOWED_TRANSITIONS.put(ProposalStatus.REVIEWED, EnumSet.of(ProposalStatus.APPROVED, ProposalStatus.REJECTED));
        ALLOWED_TRANSITIONS.put(ProposalStatus.APPROVED, EnumSet.of(ProposalStatus.FUND_ALLOCATED, ProposalStatus.ACTIVE));
        ALLOWED_TRANSITIONS.put(ProposalStatus.FUND_ALLOCATED, EnumSet.of(ProposalStatus.ACTIVE, ProposalStatus.COMPLETED, ProposalStatus.TERMINATED));
        ALLOWED_TRANSITIONS.put(ProposalStatus.ACTIVE, EnumSet.of(ProposalStatus.COMPLETED, ProposalStatus.TERMINATED));
    }

    public void validateTransition(ProposalStatus currentStatus, ProposalStatus targetStatus) {
        if (currentStatus == targetStatus) {
            return;
        }

        Set<ProposalStatus> validTargets = ALLOWED_TRANSITIONS.get(currentStatus);
        if (validTargets == null || !validTargets.contains(targetStatus)) {
            throw new ValidationException(String.format(
                    "Invalid proposal status transition from '%s' to '%s'.",
                    currentStatus.getValue(), targetStatus.getValue()
            ));
        }
    }
}
