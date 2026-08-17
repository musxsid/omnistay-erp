package com.siddharth.omnistay_erp.dto;

import com.siddharth.omnistay_erp.model.DepartmentCode;
import com.siddharth.omnistay_erp.model.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostTransactionDTO {

    @NotNull(message = "Folio ID is required")
    private UUID folioId;

    @NotNull(message = "Transaction type is required")
    private TransactionType transactionType;

    @NotNull(message = "Department code is required")
    private DepartmentCode departmentCode;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    private String referenceCode;
    private String createdBy;
}
