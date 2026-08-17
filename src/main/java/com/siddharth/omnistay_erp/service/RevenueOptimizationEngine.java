package com.siddharth.omnistay_erp.service;

import com.siddharth.omnistay_erp.model.RatePlan;
import com.siddharth.omnistay_erp.model.Room;
import com.siddharth.omnistay_erp.model.RoomStatus;
import com.siddharth.omnistay_erp.repository.RatePlanRepository;
import com.siddharth.omnistay_erp.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RevenueOptimizationEngine {

    private final RoomRepository roomRepository;
    private final RatePlanRepository ratePlanRepository;

    /**
     * Calculates dynamic room rate based on real-time property occupancy velocity,
     * lead-time booking curve, and rate plan multiplier.
     */
    public BigDecimal calculateDynamicRate(UUID propertyId, UUID roomId, UUID ratePlanId, LocalDate targetDate) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomId));

        BigDecimal baseRate = room.getDailyRate();

        // 1. Calculate Occupancy Velocity Multiplier
        List<Room> allRooms = roomRepository.findByPropertyPropertyId(propertyId);
        List<Room> occupiedRooms = roomRepository.findByPropertyPropertyIdAndStatus(propertyId, RoomStatus.OCCUPIED);

        double occupancyPct = allRooms.isEmpty() ? 0.0 : ((double) occupiedRooms.size() / allRooms.size()) * 100;
        BigDecimal occupancyMultiplier;

        if (occupancyPct < 40.0) {
            occupancyMultiplier = BigDecimal.valueOf(0.90); // 10% discount for low demand
        } else if (occupancyPct < 70.0) {
            occupancyMultiplier = BigDecimal.valueOf(1.00); // Standard rate
        } else if (occupancyPct < 85.0) {
            occupancyMultiplier = BigDecimal.valueOf(1.20); // 20% surge rate
        } else {
            occupancyMultiplier = BigDecimal.valueOf(1.45); // 45% peak demand surge
        }

        // 2. Calculate Lead Time Velocity Factor
        long leadDays = ChronoUnit.DAYS.between(LocalDate.now(), targetDate);
        BigDecimal leadTimeFactor;
        if (leadDays < 2) {
            leadTimeFactor = BigDecimal.valueOf(1.25); // Last minute premium
        } else if (leadDays > 30) {
            leadTimeFactor = BigDecimal.valueOf(0.95); // Early bird discount
        } else {
            leadTimeFactor = BigDecimal.valueOf(1.00);
        }

        // 3. Apply Rate Plan Multiplier
        BigDecimal planMultiplier = BigDecimal.ONE;
        if (ratePlanId != null) {
            planMultiplier = ratePlanRepository.findById(ratePlanId)
                    .map(RatePlan::getMultiplier)
                    .orElse(BigDecimal.ONE);
        }

        return baseRate
                .multiply(occupancyMultiplier)
                .multiply(leadTimeFactor)
                .multiply(planMultiplier)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
