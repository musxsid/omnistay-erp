package com.siddharth.omnistay_erp.service;

import com.siddharth.omnistay_erp.dto.NightAuditReportDTO;
import com.siddharth.omnistay_erp.dto.PostTransactionDTO;
import com.siddharth.omnistay_erp.model.*;
import com.siddharth.omnistay_erp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class NightAuditService {

    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;
    private final FolioRepository folioRepository;
    private final FolioTransactionRepository transactionRepository;
    private final FinancialLedgerService ledgerService;

    /**
     * Scheduled Night Audit Task running automatically at 02:00 AM daily across all property tenancies.
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void executeAutomatedNightAudit() {
        log.info("Starting Autonomous Scheduled Night Audit Execution...");
        List<Property> properties = propertyRepository.findAll();
        for (Property property : properties) {
            executeNightAuditForProperty(property.getPropertyId(), "SYSTEM_SCHEDULED_AUDITOR");
        }
    }

    /**
     * Executes the Night Audit process for a specific property:
     * 1. Posts daily room & tax charges to all active folios of CHECKED_IN guests.
     * 2. Runs ledger balance integrity sanity checks (Debits == Credits + Total Due).
     * 3. Compiles an immutable Night Audit Report.
     */
    @Transactional
    public NightAuditReportDTO executeNightAuditForProperty(UUID propertyId, String triggeredBy) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + propertyId));

        List<Room> allRooms = roomRepository.findByPropertyPropertyId(propertyId);
        List<Room> occupiedRooms = roomRepository.findByPropertyPropertyIdAndStatus(propertyId, RoomStatus.OCCUPIED);
        List<Reservation> checkedInReservations = reservationRepository
                .findByPropertyPropertyIdAndStatus(propertyId, ReservationStatus.CHECKED_IN);

        BigDecimal totalRoomChargesPosted = BigDecimal.ZERO;
        BigDecimal totalTaxesPosted = BigDecimal.ZERO;
        List<String> discrepancies = new ArrayList<>();

        // Step 1: Batch post daily room charges
        for (Reservation res : checkedInReservations) {
            Optional<Folio> folioOpt = folioRepository.findByReservationReservationId(res.getReservationId());
            if (folioOpt.isPresent()) {
                Folio folio = folioOpt.get();
                Room room = res.getAssignedRoom();
                BigDecimal roomRate = room != null ? room.getDailyRate() : res.getTotalAmount();

                try {
                    ledgerService.postTransaction(PostTransactionDTO.builder()
                            .folioId(folio.getFolioId())
                            .transactionType(TransactionType.DEBIT)
                            .departmentCode(DepartmentCode.ROOM)
                            .description("Night Audit Daily Room Charge - Room " + (room != null ? room.getRoomNumber() : "N/A"))
                            .amount(roomRate)
                            .referenceCode("AUDIT-" + System.currentTimeMillis())
                            .createdBy(triggeredBy)
                            .build());

                    totalRoomChargesPosted = totalRoomChargesPosted.add(roomRate);
                } catch (Exception e) {
                    log.error("Error posting night audit charge for folio {}", folio.getFolioId(), e);
                    discrepancies.add("Failed to post daily charge for Folio " + folio.getFolioId() + ": " + e.getMessage());
                }
            } else {
                discrepancies.add("Checked-in Reservation " + res.getConfirmationCode() + " has no active folio linked!");
            }
        }

        // Step 2: Ledger Balance Sanity Check
        boolean ledgerBalanced = true;
        List<Folio> activeFolios = folioRepository.findByPropertyPropertyIdAndIsSettledFalse(propertyId);
        for (Folio folio : activeFolios) {
            BigDecimal debits = transactionRepository.sumDebitsByFolioId(folio.getFolioId());
            BigDecimal credits = transactionRepository.sumCreditsByFolioId(folio.getFolioId());
            BigDecimal calculatedDue = debits.subtract(credits);

            if (calculatedDue.compareTo(folio.getTotalDue()) != 0) {
                ledgerBalanced = false;
                discrepancies.add("Folio " + folio.getFolioId() + " imbalance detected! Stored due: $" 
                        + folio.getTotalDue() + ", Calculated due: $" + calculatedDue);
            }
        }

        BigDecimal occupancyRatio = allRooms.isEmpty() ? BigDecimal.ZERO :
                BigDecimal.valueOf(occupiedRooms.size())
                        .divide(BigDecimal.valueOf(allRooms.size()), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));

        return NightAuditReportDTO.builder()
                .reportId(UUID.randomUUID())
                .propertyId(propertyId)
                .auditTimestamp(LocalDateTime.now())
                .totalRooms(allRooms.size())
                .occupiedRooms(occupiedRooms.size())
                .occupancyPercentage(occupancyRatio)
                .totalPostedRoomCharges(totalRoomChargesPosted)
                .totalPostedTaxes(totalTaxesPosted)
                .ledgerBalanceVerified(ledgerBalanced)
                .auditDiscrepancies(discrepancies)
                .triggeredBy(triggeredBy)
                .build();
    }
}
