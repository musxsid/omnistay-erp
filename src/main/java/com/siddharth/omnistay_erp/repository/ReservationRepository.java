package com.siddharth.omnistay_erp.repository;

import com.siddharth.omnistay_erp.model.Reservation;
import com.siddharth.omnistay_erp.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    Optional<Reservation> findByConfirmationCode(String confirmationCode);
    List<Reservation> findByPropertyPropertyId(UUID propertyId);
    List<Reservation> findByPropertyPropertyIdAndStatus(UUID propertyId, ReservationStatus status);

    @Query("SELECT r FROM Reservation r WHERE r.property.propertyId = :propertyId " +
           "AND r.assignedRoom.roomId = :roomId " +
           "AND r.status IN ('CONFIRMED', 'CHECKED_IN') " +
           "AND (r.checkInDate < :checkOutDate AND r.checkOutDate > :checkInDate)")
    List<Reservation> findOverlappingReservations(
            @Param("propertyId") UUID propertyId,
            @Param("roomId") UUID roomId,
            @Param("checkInDate") LocalDateTime checkInDate,
            @Param("checkOutDate") LocalDateTime checkOutDate);
}
