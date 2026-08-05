package com.innovaura.modules.subscription.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlanResponse {
    private Integer id;
    private String name;
    private String description;
    private BigDecimal price;
    private String targetRole;
    private Boolean active;
}
