package com.siddharth.omnistay.reservation.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pending_bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingEntity {

    @Id
    private String id;

    @Column(name = "guest_name", nullable = false)
    private String guestName;

    @Column(name = "guest_email", nullable = false)
    private String guestEmail;

    @Column(name = "guest_phone")
    private String guestPhone;

    @Column(name = "requested_room_type", nullable = false)
    private String requestedRoomType;

    @Column(name = "check_in", nullable = false)
    private String checkIn;

    @Column(name = "check_out", nullable = false)
    private String checkOut;

    @Column(nullable = false)
    private String status;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "date_requested")
    private LocalDateTime dateRequested;

    @PrePersist
    public void onCreate() {
        if (dateRequested == null) {
            dateRequested = LocalDateTime.now();
        }
    }
}
