package com.siddharth.omnistay_erp.dto;

import com.siddharth.omnistay_erp.model.DepartmentCode;
import com.siddharth.omnistay_erp.model.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FolioTransactionDTO {
    private UUID transactionId;
    private TransactionType transactionType;
    private DepartmentCode departmentCode;
    private String description;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private String referenceCode;
    private Boolean isVoided;
    private String createdBy;
    private LocalDateTime createdAt;
}
