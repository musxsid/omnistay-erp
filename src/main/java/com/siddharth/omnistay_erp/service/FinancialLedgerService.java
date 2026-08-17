package com.siddharth.omnistay_erp.service;

import com.siddharth.omnistay_erp.dto.FolioLedgerDTO;
import com.siddharth.omnistay_erp.dto.FolioTransactionDTO;
import com.siddharth.omnistay_erp.dto.InvoiceDTO;
import com.siddharth.omnistay_erp.dto.PostTransactionDTO;
import com.siddharth.omnistay_erp.exception.LedgerImbalanceException;
import com.siddharth.omnistay_erp.exception.ResourceNotFoundException;
import com.siddharth.omnistay_erp.model.*;
import com.siddharth.omnistay_erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialLedgerService {

    private final FolioRepository folioRepository;
    private final FolioTransactionRepository transactionRepository;
    private final TaxConfigurationRepository taxRepository;
    private final InvoiceRepository invoiceRepository;

    /**
     * Posts a double-entry transaction to an active Folio, calculates configured taxes automatically,
     * and updates running total due with optimistic concurrency protection.
     */
    @Transactional
    public FolioTransactionDTO postTransaction(PostTransactionDTO dto) {
        Folio folio = folioRepository.findById(dto.getFolioId())
                .orElseThrow(() -> new ResourceNotFoundException("Folio not found with ID: " + dto.getFolioId()));

        if (folio.isSettled()) {
            throw new LedgerImbalanceException("Cannot post transaction to a settled or closed folio.");
        }

        BigDecimal amount = dto.getAmount().setScale(2, RoundingMode.HALF_UP);
        BigDecimal currentDue = folio.getTotalDue();
        BigDecimal newDue;

        if (dto.getTransactionType() == TransactionType.DEBIT) {
            newDue = currentDue.add(amount);
        } else {
            newDue = currentDue.subtract(amount);
            folio.setTotalPaid(folio.getTotalPaid().add(amount));
        }

        folio.setTotalDue(newDue);

        FolioTransaction mainTxn = FolioTransaction.builder()
                .folio(folio)
                .property(folio.getProperty())
                .transactionType(dto.getTransactionType())
                .departmentCode(dto.getDepartmentCode())
                .description(dto.getDescription())
                .amount(amount)
                .balanceAfter(newDue)
                .referenceCode(dto.getReferenceCode())
                .createdBy(dto.getCreatedBy() != null ? dto.getCreatedBy() : "STAFF")
                .isVoided(false)
                .build();

        FolioTransaction savedMainTxn = transactionRepository.save(mainTxn);

        // Auto-apply taxes if DEBIT and taxes configured for department
        if (dto.getTransactionType() == TransactionType.DEBIT) {
            applyDepartmentTaxes(folio, dto.getDepartmentCode(), amount);
        }

        folioRepository.save(folio);

        return mapToTransactionDTO(savedMainTxn);
    }

    /**
     * Automatically calculates and posts tax line items based on tax configurations.
     */
    private void applyDepartmentTaxes(Folio folio, DepartmentCode departmentCode, BigDecimal baseAmount) {
        List<TaxConfiguration> activeTaxes = taxRepository
                .findByPropertyPropertyIdAndDepartmentCodeAndIsActiveTrue(folio.getProperty().getPropertyId(), departmentCode);

        for (TaxConfiguration tax : activeTaxes) {
            BigDecimal taxAmount = baseAmount.multiply(tax.getPercentage())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            if (taxAmount.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal currentDue = folio.getTotalDue();
                BigDecimal newDue = currentDue.add(taxAmount);
                folio.setTotalDue(newDue);

                FolioTransaction taxTxn = FolioTransaction.builder()
                        .folio(folio)
                        .property(folio.getProperty())
                        .transactionType(TransactionType.DEBIT)
                        .departmentCode(DepartmentCode.TAX)
                        .description(tax.getTaxName() + " (" + tax.getPercentage() + "%)")
                        .amount(taxAmount)
                        .balanceAfter(newDue)
                        .referenceCode("TAX-" + tax.getTaxCode())
                        .createdBy("SYSTEM_TAX_ENGINE")
                        .isVoided(false)
                        .build();

                transactionRepository.save(taxTxn);
            }
        }
    }

    /**
     * Retrieves the complete immutable double-entry ledger for a Folio.
     */
    @Transactional(readOnly = true)
    public FolioLedgerDTO getFolioLedger(UUID folioId) {
        Folio folio = folioRepository.findById(folioId)
                .orElseThrow(() -> new ResourceNotFoundException("Folio not found with ID: " + folioId));

        List<FolioTransaction> transactions = transactionRepository.findByFolioFolioIdOrderByCreatedAtAsc(folioId);
        BigDecimal totalDebits = transactionRepository.sumDebitsByFolioId(folioId);
        BigDecimal totalCredits = transactionRepository.sumCreditsByFolioId(folioId);

        Integer roomNo = folio.getReservation() != null && folio.getReservation().getAssignedRoom() != null ?
                folio.getReservation().getAssignedRoom().getRoomNumber() : null;

        List<FolioTransactionDTO> txnDtos = transactions.stream()
                .map(this::mapToTransactionDTO)
                .collect(Collectors.toList());

        return FolioLedgerDTO.builder()
                .folioId(folio.getFolioId())
                .propertyId(folio.getProperty().getPropertyId())
                .guestId(folio.getGuest().getGuestId())
                .guestName(folio.getGuest().getFullName())
                .roomNumber(roomNo)
                .folioStatus(folio.getStatus())
                .checkInDate(folio.getCheckInDate())
                .checkOutDate(folio.getCheckOutDate())
                .isSettled(folio.isSettled())
                .totalDebits(totalDebits)
                .totalCredits(totalCredits)
                .totalDue(folio.getTotalDue())
                .transactions(txnDtos)
                .build();
    }

    /**
     * Settles a Folio, verifies ledger balance integrity (Debits == Credits), and issues a fiscal Invoice.
     */
    @Transactional
    public InvoiceDTO settleFolio(UUID folioId, String paymentMethod) {
        Folio folio = folioRepository.findById(folioId)
                .orElseThrow(() -> new ResourceNotFoundException("Folio not found with ID: " + folioId));

        if (folio.isSettled()) {
            throw new LedgerImbalanceException("Folio is already settled.");
        }

        BigDecimal remainingDue = folio.getTotalDue();
        if (remainingDue.compareTo(BigDecimal.ZERO) > 0) {
            // Post final credit payment transaction to balance the ledger
            postTransaction(PostTransactionDTO.builder()
                    .folioId(folioId)
                    .transactionType(TransactionType.CREDIT)
                    .departmentCode(DepartmentCode.PAYMENT)
                    .description("Settlement Payment via " + paymentMethod)
                    .amount(remainingDue)
                    .referenceCode("SETTLE-" + System.currentTimeMillis())
                    .createdBy("FRONT_DESK")
                    .build());
            folio = folioRepository.findById(folioId).get();
        }

        folio.setSettled(true);
        folio.setStatus("SETTLED");
        folioRepository.save(folio);

        // Generate Fiscal Invoice
        BigDecimal totalDebits = transactionRepository.sumDebitsByFolioId(folioId);
        
        Invoice invoice = Invoice.builder()
                .folio(folio)
                .property(folio.getProperty())
                .invoiceNumber("INV-" + System.currentTimeMillis())
                .guestName(folio.getGuest().getFullName())
                .issueDate(LocalDateTime.now())
                .totalAmount(totalDebits)
                .taxAmount(BigDecimal.ZERO) // Can be expanded for tax breakdown
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);

        return InvoiceDTO.builder()
                .invoiceId(savedInvoice.getInvoiceId())
                .folioId(folioId)
                .invoiceNumber(savedInvoice.getInvoiceNumber())
                .guestName(savedInvoice.getGuestName())
                .issueDate(savedInvoice.getIssueDate())
                .totalAmount(savedInvoice.getTotalAmount())
                .taxAmount(savedInvoice.getTaxAmount())
                .build();
    }

    private FolioTransactionDTO mapToTransactionDTO(FolioTransaction txn) {
        return FolioTransactionDTO.builder()
                .transactionId(txn.getTransactionId())
                .transactionType(txn.getTransactionType())
                .departmentCode(txn.getDepartmentCode())
                .description(txn.getDescription())
                .amount(txn.getAmount())
                .balanceAfter(txn.getBalanceAfter())
                .referenceCode(txn.getReferenceCode())
                .isVoided(txn.getIsVoided())
                .createdBy(txn.getCreatedBy())
                .createdAt(txn.getCreatedAt())
                .build();
    }
}
