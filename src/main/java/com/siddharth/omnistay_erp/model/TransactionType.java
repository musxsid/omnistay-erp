package com.siddharth.omnistay_erp.model;

public enum TransactionType {
    DEBIT,  // Charge to folio (Increases total due)
    CREDIT  // Payment or refund applied to folio (Decreases total due)
}
