package com.siddharth.omnistay_erp.service;

import com.siddharth.omnistay_erp.dto.PostTransactionDTO;
import com.siddharth.omnistay_erp.dto.ReservationRequestDTO;
import com.siddharth.omnistay_erp.dto.ReservationResponseDTO;
import com.siddharth.omnistay_erp.exception.InvalidReservationStateException;
import com.siddharth.omnistay_erp.exception.ResourceNotFoundException;
import com.siddharth.omnistay_erp.model.*;
import com.siddharth.omnistay_erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final PropertyRepository propertyRepository;
    private final GuestRepository guestRepository;
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RatePlanRepository ratePlanRepository;
    private final FolioRepository folioRepository;
    private final FinancialLedgerService ledgerService;

    /**
     * Creates a new guest reservation with atomic concurrency and state initialization.
     */
    @Transactional
    public ReservationResponseDTO createReservation(ReservationRequestDTO dto) {
        if (dto.getCheckOutDate().isBefore(dto.getCheckInDate()) || dto.getCheckOutDate().isEqual(dto.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date.");
        }

        Property property = propertyRepository.findById(dto.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + dto.getPropertyId()));

        // Find or create guest
        Guest guest = guestRepository.findByPropertyPropertyIdAndEmail(property.getPropertyId(), dto.getGuestEmail())
                .orElseGet(() -> guestRepository.save(Guest.builder()
                        .property(property)
                        .fullName(dto.getGuestName())
                        .email(dto.getGuestEmail())
                        .phone(dto.getGuestPhone())
                        .identificationNo(dto.getIdentificationNo())
                        .build()));

        // Assign Room if roomNumber provided
        Room room = null;
        if (dto.getRoomNumber() != null) {
            room = roomRepository.findByPropertyPropertyIdAndRoomNumber(property.getPropertyId(), dto.getRoomNumber())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + dto.getRoomNumber()));

            // Check for overlapping reservations
            List<Reservation> overlapping = reservationRepository.findOverlappingReservations(
                    property.getPropertyId(), room.getRoomId(), dto.getCheckInDate(), dto.getCheckOutDate());
            if (!overlapping.isEmpty()) {
                throw new InvalidReservationStateException("Room " + dto.getRoomNumber() + " is not available for the selected dates.");
            }
        }

        // Calculate rate based on days and room / rate plan
        long days = ChronoUnit.DAYS.between(dto.getCheckInDate(), dto.getCheckOutDate());
        if (days <= 0) days = 1;

        BigDecimal dailyRate = room != null ? room.getDailyRate() : BigDecimal.valueOf(150.00);
        BigDecimal totalAmount = dailyRate.multiply(BigDecimal.valueOf(days));

        String confirmationCode = "CONF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Reservation reservation = Reservation.builder()
                .property(property)
                .guest(guest)
                .assignedRoom(room)
                .confirmationCode(confirmationCode)
                .checkInDate(dto.getCheckInDate())
                .checkOutDate(dto.getCheckOutDate())
                .adultCount(dto.getAdultCount())
                .childCount(dto.getChildCount())
                .status(ReservationStatus.CONFIRMED)
                .totalAmount(totalAmount)
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);

        return mapToResponseDTO(savedReservation);
    }

    /**
     * Executes atomic guest Check-in:
     * 1. Validates reservation status == CONFIRMED
     * 2. Instantiates active Folio
     * 3. Sets Room status to OCCUPIED
     * 4. Updates Reservation status to CHECKED_IN
     * 5. Posts initial room charge to Folio
     */
    @Transactional
    public ReservationResponseDTO checkIn(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new InvalidReservationStateException("Only CONFIRMED reservations can be checked in. Current status: " + reservation.getStatus());
        }

        Room room = reservation.getAssignedRoom();
        if (room == null) {
            throw new InvalidReservationStateException("Cannot check-in: No room has been assigned to this reservation.");
        }

        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);

        // Instantiate active Folio
        Folio folio = Folio.builder()
                .property(reservation.getProperty())
                .reservation(reservation)
                .guest(reservation.getGuest())
                .status("ACTIVE")
                .checkInDate(LocalDateTime.now())
                .checkOutDate(reservation.getCheckOutDate())
                .isSettled(false)
                .totalDue(BigDecimal.ZERO)
                .totalPaid(BigDecimal.ZERO)
                .build();

        Folio savedFolio = folioRepository.save(folio);

        // Link active folio to guest
        Guest guest = reservation.getGuest();
        guest.setActiveFolio(savedFolio);
        guestRepository.save(guest);

        reservation.setStatus(ReservationStatus.CHECKED_IN);
        Reservation updatedReservation = reservationRepository.save(reservation);

        // Post initial lodging charge to folio
        ledgerService.postTransaction(PostTransactionDTO.builder()
                .folioId(savedFolio.getFolioId())
                .transactionType(TransactionType.DEBIT)
                .departmentCode(DepartmentCode.ROOM)
                .description("Initial Lodging Charge - Room " + room.getRoomNumber())
                .amount(room.getDailyRate())
                .referenceCode("CHKIN-" + reservation.getConfirmationCode())
                .createdBy("FRONT_DESK")
                .build());

        return mapToResponseDTO(updatedReservation);
    }

    /**
     * Executes atomic guest Check-out:
     * 1. Validates reservation status == CHECKED_IN
     * 2. Verifies Folio is fully settled (totalDue == 0)
     * 3. Transitions Room status to DIRTY (Needs Cleaning)
     * 4. Updates Reservation status to CHECKED_OUT
     */
    @Transactional
    public ReservationResponseDTO checkOut(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        if (reservation.getStatus() != ReservationStatus.CHECKED_IN) {
            throw new InvalidReservationStateException("Only CHECKED_IN reservations can be checked out. Current status: " + reservation.getStatus());
        }

        Folio folio = folioRepository.findByReservationReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Active folio not found for reservation: " + reservationId));

        if (!folio.isSettled() && folio.getTotalDue().compareTo(BigDecimal.ZERO) > 0) {
            throw new InvalidReservationStateException("Cannot check-out guest: Outstanding balance of $" + folio.getTotalDue() + " remains on folio.");
        }

        Room room = reservation.getAssignedRoom();
        if (room != null) {
            room.setStatus(RoomStatus.DIRTY);
            roomRepository.save(room);
        }

        // Unlink active folio from guest
        Guest guest = reservation.getGuest();
        guest.setActiveFolio(null);
        guestRepository.save(guest);

        folio.setStatus("CLOSED");
        folioRepository.save(folio);

        reservation.setStatus(ReservationStatus.CHECKED_OUT);
        Reservation updatedReservation = reservationRepository.save(reservation);

        return mapToResponseDTO(updatedReservation);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getReservationsByProperty(UUID propertyId) {
        return reservationRepository.findByPropertyPropertyId(propertyId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private ReservationResponseDTO mapToResponseDTO(Reservation res) {
        UUID folioId = folioRepository.findByReservationReservationId(res.getReservationId())
                .map(Folio::getFolioId).orElse(null);

        return ReservationResponseDTO.builder()
                .reservationId(res.getReservationId())
                .confirmationCode(res.getConfirmationCode())
                .propertyId(res.getProperty().getPropertyId())
                .propertyName(res.getProperty().getName())
                .guestId(res.getGuest().getGuestId())
                .guestName(res.getGuest().getFullName())
                .guestEmail(res.getGuest().getEmail())
                .roomNumber(res.getAssignedRoom() != null ? res.getAssignedRoom().getRoomNumber() : null)
                .roomTypeName(res.getAssignedRoom() != null && res.getAssignedRoom().getRoomType() != null ? res.getAssignedRoom().getRoomType().getName() : "Standard")
                .checkInDate(res.getCheckInDate())
                .checkOutDate(res.getCheckOutDate())
                .status(res.getStatus())
                .totalAmount(res.getTotalAmount())
                .folioId(folioId)
                .build();
    }
}
