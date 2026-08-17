package com.siddharth.omnistay_erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NightAuditReportDTO {
    private UUID reportId;
    private UUID propertyId;
    private LocalDateTime auditTimestamp;
    private Integer totalRooms;
    private Integer occupiedRooms;
    private BigDecimal occupancyPercentage;
    private BigDecimal totalPostedRoomCharges;
    private BigDecimal totalPostedTaxes;
    private Boolean ledgerBalanceVerified;
    private List<String> auditDiscrepancies;
    private String triggeredBy;
}
