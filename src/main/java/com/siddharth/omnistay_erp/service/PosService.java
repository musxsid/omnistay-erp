package com.siddharth.omnistay_erp.service;

import com.siddharth.omnistay_erp.dto.FolioTransactionDTO;
import com.siddharth.omnistay_erp.dto.PostTransactionDTO;
import com.siddharth.omnistay_erp.exception.InvalidReservationStateException;
import com.siddharth.omnistay_erp.exception.ResourceNotFoundException;
import com.siddharth.omnistay_erp.model.DepartmentCode;
import com.siddharth.omnistay_erp.model.Folio;
import com.siddharth.omnistay_erp.model.Room;
import com.siddharth.omnistay_erp.model.TransactionType;
import com.siddharth.omnistay_erp.repository.FolioRepository;
import com.siddharth.omnistay_erp.repository.RoomRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PosService {

    private final FolioRepository folioRepository;
    private final RoomRepository roomRepository;
    private final FinancialLedgerService ledgerService;
    private final SimpMessagingTemplate messagingTemplate;

    @Data
    @Builder
    public static class PosChargeRequestDTO {
        private UUID propertyId;
        private Integer roomNumber;
        private String itemName;
        private BigDecimal amount;
        private String referenceTicket;
        private String operatorName;
    }

    /**
     * Executes atomic POS charge to active guest room folio with concurrent idempotency.
     */
    @Transactional
    public FolioTransactionDTO chargeToRoom(PosChargeRequestDTO request) {
        log.info("Processing POS Charge of ${} for Room {} (Item: {})", request.getAmount(), request.getRoomNumber(), request.getItemName());

        Room room = roomRepository.findByPropertyPropertyIdAndRoomNumber(request.getPropertyId(), request.getRoomNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Room " + request.getRoomNumber() + " not found."));

        // Find active folio linked to this room reservation
        Folio folio = folioRepository.findAll().stream()
                .filter(f -> !f.isSettled() && f.getReservation() != null &&
                        f.getReservation().getAssignedRoom() != null &&
                        f.getReservation().getAssignedRoom().getRoomId().equals(room.getRoomId()))
                .findFirst()
                .orElseThrow(() -> new InvalidReservationStateException("No active guest folio found for Room " + request.getRoomNumber()));

        FolioTransactionDTO result = ledgerService.postTransaction(PostTransactionDTO.builder()
                .folioId(folio.getFolioId())
                .transactionType(TransactionType.DEBIT)
                .departmentCode(DepartmentCode.F_AND_B)
                .description("POS charge: " + request.getItemName())
                .amount(request.getAmount())
                .referenceCode(request.getReferenceTicket())
                .createdBy(request.getOperatorName() != null ? request.getOperatorName() : "POS_OPERATOR")
                .build());

        // Broadcast real-time WebSocket update for room matrix / folio balances
        messagingTemplate.convertAndSend("/topic/room-matrix-updates", result);

        return result;
    }
}
