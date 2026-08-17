package com.siddharth.omnistay_erp.controller;

import com.siddharth.omnistay_erp.dto.FolioTransactionDTO;
import com.siddharth.omnistay_erp.service.PosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pos")
@RequiredArgsConstructor
public class PosController {

    private final PosService posService;

    @PostMapping("/charge-to-room")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'POS_OPERATOR', 'PROPERTY_MANAGER', 'FRONT_DESK')")
    public ResponseEntity<FolioTransactionDTO> chargeToRoom(@RequestBody PosService.PosChargeRequestDTO request) {
        FolioTransactionDTO result = posService.chargeToRoom(request);
        return ResponseEntity.ok(result);
    }
}
