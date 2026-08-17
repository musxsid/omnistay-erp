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
public class FolioLedgerDTO {
    private UUID folioId;
    private UUID propertyId;
    private UUID guestId;
    private String guestName;
    private Integer roomNumber;
    private String folioStatus;
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
    private Boolean isSettled;
    private BigDecimal totalDebits;
    private BigDecimal totalCredits;
    private BigDecimal totalDue;
    private List<FolioTransactionDTO> transactions;
}
