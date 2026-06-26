package com.innovaura.modules.proposal.entity;

import lombok.Getter;

@Getter
public enum ProposalStatus {
    DRAFT("Draft"),
    SUBMITTED("Submitted"),
    UNDER_REVIEW("UnderReview"),
    REVIEWED("Reviewed"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    FUND_ALLOCATED("FundAllocated"),
    ACTIVE("Active"),
    COMPLETED("Completed"),
    TERMINATED("Terminated");

    private final String value;

    ProposalStatus(String value) {
        this.value = value;
    }

    public static ProposalStatus fromValue(String value) {
        if (value == null) return DRAFT;
        for (ProposalStatus status : ProposalStatus.values()) {
            if (status.value.equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        return DRAFT;
    }
}
