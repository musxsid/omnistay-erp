package com.siddharth.omnistay_erp.ai;

import com.siddharth.omnistay_erp.dto.NightAuditReportDTO;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NightAuditAnomalyAgent {

    @Data
    @Builder
    public static class AnomalyResolutionPlan {
        private String anomalySeverity;
        private List<String> identifiedRisks;
        private List<String> recommendedActionItems;
        private String managerExecutiveSummary;
    }

    /**
     * Agent Method: Analyzes night audit report discrepancies and guest complaints to build actionable resolution plans.
     */
    public AnomalyResolutionPlan analyzeAuditDiscrepancies(NightAuditReportDTO auditReport, List<String> guestComplaints) {
        log.info("Agent Executing Tool: analyzeAuditDiscrepancies for property {}", auditReport.getPropertyId());
        
        List<String> risks = new ArrayList<>();
        List<String> actions = new ArrayList<>();
        String severity = "LOW";

        if (!auditReport.getLedgerBalanceVerified()) {
            severity = "HIGH_CRITICAL";
            risks.add("Financial Ledger Imbalance Detected across active folios.");
            actions.add("Freeze manual adjustments on disputed folios and run double-entry audit reconciliation query.");
        }

        if (auditReport.getAuditDiscrepancies() != null && !auditReport.getAuditDiscrepancies().isEmpty()) {
            if (!"HIGH_CRITICAL".equals(severity)) severity = "MEDIUM";
            risks.addAll(auditReport.getAuditDiscrepancies());
            actions.add("Verify front-desk check-in logs for missing guest folio attachments.");
        }

        if (guestComplaints != null && !guestComplaints.isEmpty()) {
            actions.add("Dispatch Guest Relations team for complaint remediation on " + guestComplaints.size() + " reported issues.");
        }

        String summary = String.format("Night Audit Analysis for Property %s completed. Discovered %d discrepancies and %d risks. Action severity level: %s.",
                auditReport.getPropertyId(), auditReport.getAuditDiscrepancies().size(), risks.size(), severity);

        return AnomalyResolutionPlan.builder()
                .anomalySeverity(severity)
                .identifiedRisks(risks)
                .recommendedActionItems(actions)
                .managerExecutiveSummary(summary)
                .build();
    }
}
