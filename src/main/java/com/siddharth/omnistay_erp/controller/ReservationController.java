package com.siddharth.omnistay_erp.controller;

import com.siddharth.omnistay_erp.dto.ReservationRequestDTO;
import com.siddharth.omnistay_erp.dto.ReservationResponseDTO;
import com.siddharth.omnistay_erp.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationResponseDTO> createReservation(@Valid @RequestBody ReservationRequestDTO dto) {
        ReservationResponseDTO response = reservationService.createReservation(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/{reservationId}/check-in")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER', 'FRONT_DESK')")
    public ResponseEntity<ReservationResponseDTO> checkIn(@PathVariable UUID reservationId) {
        ReservationResponseDTO response = reservationService.checkIn(reservationId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{reservationId}/check-out")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER', 'FRONT_DESK')")
    public ResponseEntity<ReservationResponseDTO> checkOut(@PathVariable UUID reservationId) {
        ReservationResponseDTO response = reservationService.checkOut(reservationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}")
    @PreAuthorize("@tenantSecurity.hasPropertyAccess(authentication, #propertyId)")
    public ResponseEntity<List<ReservationResponseDTO>> getReservationsByProperty(@PathVariable UUID propertyId) {
        List<ReservationResponseDTO> list = reservationService.getReservationsByProperty(propertyId);
        return ResponseEntity.ok(list);
    }
}
