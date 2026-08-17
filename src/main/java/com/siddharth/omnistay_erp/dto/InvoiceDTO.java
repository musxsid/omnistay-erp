package com.siddharth.omnistay_erp.dto;

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
public class InvoiceDTO {
    private UUID invoiceId;
    private UUID folioId;
    private String invoiceNumber;
    private String guestName;
    private LocalDateTime issueDate;
    private BigDecimal totalAmount;
    private BigDecimal taxAmount;
    private String pdfUrl;
}
