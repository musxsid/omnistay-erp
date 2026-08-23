package com.siddharth.omnistay.reservation.controller;

import com.siddharth.omnistay.reservation.entity.*;
import com.siddharth.omnistay.reservation.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ReservationApiController {

    private final SuiteRepository suiteRepository;
    private final DiningRepository diningRepository;
    private final SpaRepository spaRepository;
    private final BookingRepository bookingRepository;
    private final OccupiedRoomRepository occupiedRoomRepository;
    private final FolioTransactionRepository folioTransactionRepository;
    private final RoomStatusRepository roomStatusRepository;
    private final InvoiceRepository invoiceRepository;

    public ReservationApiController(
            SuiteRepository suiteRepository,
            DiningRepository diningRepository,
            SpaRepository spaRepository,
            BookingRepository bookingRepository,
            OccupiedRoomRepository occupiedRoomRepository,
            FolioTransactionRepository folioTransactionRepository,
            RoomStatusRepository roomStatusRepository,
            InvoiceRepository invoiceRepository) {
        this.suiteRepository = suiteRepository;
        this.diningRepository = diningRepository;
        this.spaRepository = spaRepository;
        this.bookingRepository = bookingRepository;
        this.occupiedRoomRepository = occupiedRoomRepository;
        this.folioTransactionRepository = folioTransactionRepository;
        this.roomStatusRepository = roomStatusRepository;
        this.invoiceRepository = invoiceRepository;
    }

    // --- Suites & Catalog ---
    @GetMapping("/suites")
    public List<SuiteEntity> getSuites() {
        return suiteRepository.findAll();
    }

    @GetMapping("/dining")
    public List<DiningEntity> getDiningItems() {
        return diningRepository.findAll();
    }

    @GetMapping("/spa")
    public List<SpaEntity> getSpaServices() {
        return spaRepository.findAll();
    }

    // --- Pending Bookings ---
    @GetMapping("/bookings")
    public List<BookingEntity> getPendingBookings() {
        return bookingRepository.findAll();
    }

    @PostMapping("/bookings")
    public ResponseEntity<BookingEntity> createBooking(@RequestBody BookingEntity booking) {
        if (booking.getId() == null || booking.getId().isEmpty()) {
            booking.setId("BK-" + (1000 + new Random().nextInt(9000)));
        }
        booking.setStatus("PENDING_APPROVAL");
        booking.setDateRequested(LocalDateTime.now());
        BookingEntity saved = bookingRepository.save(booking);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/bookings/{id}/approve")
    @Transactional
    public ResponseEntity<?> approveBooking(@PathVariable String id, @RequestParam String roomNumber) {
        Optional<BookingEntity> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Booking request not found");
        }

        Optional<OccupiedRoomEntity> existing = occupiedRoomRepository.findById(roomNumber);
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body("Suite " + roomNumber + " is already OCCUPIED");
        }

        BookingEntity booking = bookingOpt.get();
        String folioId = "FOL-" + roomNumber + "-" + System.currentTimeMillis() % 10000;

        OccupiedRoomEntity occupiedRoom = OccupiedRoomEntity.builder()
                .roomNumber(roomNumber)
                .guestName(booking.getGuestName())
                .guestEmail(booking.getGuestEmail())
                .guestPhone(booking.getGuestPhone())
                .folioId(folioId)
                .status("OCCUPIED")
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .nightlyRate(booking.getTotalAmount() != null ? booking.getTotalAmount() : new BigDecimal("450.00"))
                .build();

        occupiedRoomRepository.save(occupiedRoom);

        // Delete from pending
        bookingRepository.deleteById(id);

        // Initial Lodging Charge in PostgreSQL
        FolioTransactionEntity initTxn = FolioTransactionEntity.builder()
                .id("tx-" + roomNumber + "-lodging-" + System.currentTimeMillis())
                .roomNumber(roomNumber)
                .transactionDate(LocalDateTime.now().toString())
                .description("Room " + roomNumber + " Lodging Stay Rate (" + booking.getRequestedRoomType() + ")")
                .amount(occupiedRoom.getNightlyRate())
                .departmentCode("ROOM")
                .guestName(booking.getGuestName())
                .build();
        folioTransactionRepository.save(initTxn);

        return ResponseEntity.ok(occupiedRoom);
    }

    // --- Active Occupied Rooms & Room Matrix ---
    @GetMapping("/rooms/matrix")
    public List<OccupiedRoomEntity> getOccupiedRooms() {
        return occupiedRoomRepository.findAll();
    }

    @GetMapping("/room-statuses")
    public List<RoomStatusEntity> getRoomStatuses() {
        return roomStatusRepository.findAll();
    }

    @PutMapping("/rooms/{roomNumber}/status")
    public ResponseEntity<RoomStatusEntity> updateRoomStatus(@PathVariable String roomNumber, @RequestParam String status) {
        RoomStatusEntity roomStatus = roomStatusRepository.findById(roomNumber)
                .orElse(RoomStatusEntity.builder().roomNumber(roomNumber).build());
        roomStatus.setCleaningStatus(status);
        RoomStatusEntity saved = roomStatusRepository.save(roomStatus);
        return ResponseEntity.ok(saved);
    }

    // --- Folio Line Item Transactions ---
    @GetMapping("/folios/{roomNumber}")
    public List<FolioTransactionEntity> getFolioTransactions(@PathVariable String roomNumber) {
        return folioTransactionRepository.findByRoomNumber(roomNumber);
    }

    @PostMapping("/folios/{roomNumber}/transactions")
    public ResponseEntity<FolioTransactionEntity> addTransaction(@PathVariable String roomNumber, @RequestBody FolioTransactionEntity txn) {
        if (txn.getId() == null || txn.getId().isEmpty()) {
            txn.setId("tx-" + roomNumber + "-" + System.currentTimeMillis());
        }
        txn.setRoomNumber(roomNumber);
        if (txn.getTransactionDate() == null) {
            txn.setTransactionDate(LocalDateTime.now().toString());
        }
        FolioTransactionEntity saved = folioTransactionRepository.save(txn);
        return ResponseEntity.ok(saved);
    }

    // --- Checkout & Settle Invoice ---
    @PostMapping("/folios/{roomNumber}/checkout")
    @Transactional
    public ResponseEntity<?> checkoutRoom(@PathVariable String roomNumber) {
        Optional<OccupiedRoomEntity> roomOpt = occupiedRoomRepository.findById(roomNumber);
        if (roomOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Room " + roomNumber + " is not occupied.");
        }

        OccupiedRoomEntity room = roomOpt.get();
        List<FolioTransactionEntity> txns = folioTransactionRepository.findByRoomNumber(roomNumber);

        BigDecimal subtotal = txns.stream()
                .map(FolioTransactionEntity::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.10"));
        BigDecimal grandTotal = subtotal.add(tax);

        InvoiceEntity invoice = InvoiceEntity.builder()
                .invoiceId("INV-" + roomNumber + "-" + (System.currentTimeMillis() % 1000000))
                .roomNumber(roomNumber)
                .guestName(room.getGuestName())
                .guestEmail(room.getGuestEmail())
                .guestPhone(room.getGuestPhone())
                .folioId(room.getFolioId())
                .checkIn(room.getCheckIn())
                .checkOut(LocalDateTime.now().toString())
                .subtotal(subtotal)
                .taxAmount(tax)
                .grandTotal(grandTotal)
                .status("PAID_AND_SETTLED")
                .settledAt(LocalDateTime.now().toString())
                .build();

        invoiceRepository.save(invoice);

        // Remove from occupied_rooms
        occupiedRoomRepository.deleteById(roomNumber);

        // Delete active folio transactions for this room
        folioTransactionRepository.deleteByRoomNumber(roomNumber);

        // Mark suite as DIRTY in room_statuses
        RoomStatusEntity statusEntity = roomStatusRepository.findById(roomNumber)
                .orElse(RoomStatusEntity.builder().roomNumber(roomNumber).build());
        statusEntity.setCleaningStatus("DIRTY");
        roomStatusRepository.save(statusEntity);

        return ResponseEntity.ok(invoice);
    }

    // --- Invoices Archive ---
    @GetMapping("/invoices")
    public List<InvoiceEntity> getInvoices() {
        return invoiceRepository.findAll();
    }
}
