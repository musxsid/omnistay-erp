package com.siddharth.omnistay_erp.controller;

import com.siddharth.omnistay_erp.ai.FrontDeskAgent;
import com.siddharth.omnistay_erp.ai.HousekeepingDispatcherAgent;
import com.siddharth.omnistay_erp.ai.NightAuditAnomalyAgent;
import com.siddharth.omnistay_erp.dto.NightAuditReportDTO;
import com.siddharth.omnistay_erp.dto.ReservationRequestDTO;
import com.siddharth.omnistay_erp.dto.ReservationResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiAgentController {

    private final FrontDeskAgent frontDeskAgent;
    private final NightAuditAnomalyAgent nightAuditAnomalyAgent;
    private final HousekeepingDispatcherAgent housekeepingDispatcherAgent;

    @GetMapping("/concierge/rooms")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'FRONT_DESK', 'GUEST')")
    public ResponseEntity<List<Map<String, Object>>> searchRooms(@RequestParam UUID propertyId) {
        return ResponseEntity.ok(frontDeskAgent.searchAvailableRoomsTool(propertyId));
    }

    @PostMapping("/concierge/book")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'FRONT_DESK', 'GUEST')")
    public ResponseEntity<ReservationResponseDTO> executeAgentBooking(@RequestBody ReservationRequestDTO request) {
        return ResponseEntity.ok(frontDeskAgent.executeBookingTool(request));
    }

    @PostMapping("/anomaly/analyze")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER', 'NIGHT_AUDITOR')")
    public ResponseEntity<NightAuditAnomalyAgent.AnomalyResolutionPlan> analyzeAuditDiscrepancies(
            @RequestBody NightAuditReportDTO report,
            @RequestParam(required = false) List<String> complaints) {
        return ResponseEntity.ok(nightAuditAnomalyAgent.analyzeAuditDiscrepancies(report, complaints));
    }

    @GetMapping("/housekeeping/dispatch-queue")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER', 'HOUSEKEEPING')")
    public ResponseEntity<List<HousekeepingDispatcherAgent.CleaningDispatchTask>> getHousekeepingQueue(@RequestParam UUID propertyId) {
        return ResponseEntity.ok(housekeepingDispatcherAgent.generateCleaningPriorityQueue(propertyId));
    }
}
