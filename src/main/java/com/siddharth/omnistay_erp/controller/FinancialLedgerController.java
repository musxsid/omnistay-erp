package com.siddharth.omnistay_erp.controller;

import com.siddharth.omnistay_erp.dto.FolioLedgerDTO;
import com.siddharth.omnistay_erp.dto.FolioTransactionDTO;
import com.siddharth.omnistay_erp.dto.InvoiceDTO;
import com.siddharth.omnistay_erp.dto.PostTransactionDTO;
import com.siddharth.omnistay_erp.service.FinancialLedgerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ledger")
@RequiredArgsConstructor
public class FinancialLedgerController {

    private final FinancialLedgerService ledgerService;

    @PostMapping("/transactions")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER', 'FRONT_DESK', 'POS_OPERATOR')")
    public ResponseEntity<FolioTransactionDTO> postTransaction(@Valid @RequestBody PostTransactionDTO dto) {
        FolioTransactionDTO result = ledgerService.postTransaction(dto);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/folios/{folioId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER', 'FRONT_DESK', 'NIGHT_AUDITOR')")
    public ResponseEntity<FolioLedgerDTO> getFolioLedger(@PathVariable UUID folioId) {
        FolioLedgerDTO ledger = ledgerService.getFolioLedger(folioId);
        return ResponseEntity.ok(ledger);
    }

    @PostMapping("/folios/{folioId}/settle")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER', 'FRONT_DESK')")
    public ResponseEntity<InvoiceDTO> settleFolio(
            @PathVariable UUID folioId,
            @RequestParam(defaultValue = "CREDIT_CARD") String paymentMethod) {
        InvoiceDTO invoice = ledgerService.settleFolio(folioId, paymentMethod);
        return ResponseEntity.ok(invoice);
    }
}
