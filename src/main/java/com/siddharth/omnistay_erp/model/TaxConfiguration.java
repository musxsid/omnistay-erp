package com.siddharth.omnistay_erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "tax_configurations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"property_id", "tax_code"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "tax_id")
    private UUID taxId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "tax_code", nullable = false, length = 20)
    private String taxCode;

    @Column(name = "tax_name", nullable = false, length = 100)
    private String taxName;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal percentage;

    @Enumerated(EnumType.STRING)
    @Column(name = "department_code", nullable = false, length = 20)
    private DepartmentCode departmentCode;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
