package com.siddharth.omnistay_erp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationRequestDTO {

    @NotNull(message = "Property ID is required")
    private UUID propertyId;

    @NotBlank(message = "Guest full name is required")
    private String guestName;

    @Email(message = "Valid email required")
    private String guestEmail;

    private String guestPhone;
    private String identificationNo;

    private UUID roomTypeId;
    private UUID ratePlanId;
    private Integer roomNumber;

    @NotNull(message = "Check-in date is required")
    private LocalDateTime checkInDate;

    @NotNull(message = "Check-out date is required")
    private LocalDateTime checkOutDate;

    @Builder.Default
    private Integer adultCount = 1;

    @Builder.Default
    private Integer childCount = 0;
}
