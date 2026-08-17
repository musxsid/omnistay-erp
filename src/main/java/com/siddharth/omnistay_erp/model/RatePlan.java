package com.siddharth.omnistay_erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "rate_plans", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"property_id", "code"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "rate_plan_id")
    private UUID ratePlanId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal multiplier = BigDecimal.valueOf(1.00);

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
