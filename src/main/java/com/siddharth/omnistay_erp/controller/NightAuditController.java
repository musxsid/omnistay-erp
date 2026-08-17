package com.siddharth.omnistay_erp.controller;

import com.siddharth.omnistay_erp.dto.NightAuditReportDTO;
import com.siddharth.omnistay_erp.service.NightAuditService;
import com.siddharth.omnistay_erp.service.RevenueOptimizationEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
public class NightAuditController {

    private final NightAuditService nightAuditService;
    private final RevenueOptimizationEngine revenueOptimizationEngine;

    @PostMapping("/night-audit/{propertyId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'NIGHT_AUDITOR', 'PROPERTY_MANAGER')")
    public ResponseEntity<NightAuditReportDTO> triggerManualNightAudit(@PathVariable UUID propertyId) {
        NightAuditReportDTO report = nightAuditService.executeNightAuditForProperty(propertyId, "MANUAL_OPERATOR");
        return ResponseEntity.ok(report);
    }

    @GetMapping("/dynamic-rate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER', 'FRONT_DESK', 'GUEST')")
    public ResponseEntity<Map<String, Object>> getDynamicRate(
            @RequestParam UUID propertyId,
            @RequestParam UUID roomId,
            @RequestParam(required = false) UUID ratePlanId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate targetDate) {
        
        BigDecimal rate = revenueOptimizationEngine.calculateDynamicRate(propertyId, roomId, ratePlanId, targetDate);
        return ResponseEntity.ok(Map.of(
                "propertyId", propertyId,
                "roomId", roomId,
                "targetDate", targetDate,
                "dynamicRate", rate
        ));
    }
}
