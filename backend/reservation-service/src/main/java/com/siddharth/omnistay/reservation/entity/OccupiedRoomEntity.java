package com.siddharth.omnistay.reservation.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "occupied_rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OccupiedRoomEntity {

    @Id
    @Column(name = "room_number")
    private String roomNumber;

    @Column(name = "guest_name", nullable = false)
    private String guestName;

    @Column(name = "guest_email")
    private String guestEmail;

    @Column(name = "guest_phone")
    private String guestPhone;

    @Column(name = "folio_id", nullable = false)
    private String folioId;

    @Column(nullable = false)
    private String status;

    @Column(name = "check_in", nullable = false)
    private String checkIn;

    @Column(name = "check_out", nullable = false)
    private String checkOut;

    @Column(name = "nightly_rate", nullable = false)
    private BigDecimal nightlyRate;
}
