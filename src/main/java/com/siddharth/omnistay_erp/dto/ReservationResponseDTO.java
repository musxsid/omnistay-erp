package com.siddharth.omnistay_erp.dto;

import com.siddharth.omnistay_erp.model.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationResponseDTO {
    private UUID reservationId;
    private String confirmationCode;
    private UUID propertyId;
    private String propertyName;
    private UUID guestId;
    private String guestName;
    private String guestEmail;
    private Integer roomNumber;
    private String roomTypeName;
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
    private ReservationStatus status;
    private BigDecimal totalAmount;
    private UUID folioId;
}
