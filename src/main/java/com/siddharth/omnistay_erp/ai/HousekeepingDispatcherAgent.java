package com.siddharth.omnistay_erp.ai;

import com.siddharth.omnistay_erp.model.Room;
import com.siddharth.omnistay_erp.model.RoomStatus;
import com.siddharth.omnistay_erp.repository.RoomRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HousekeepingDispatcherAgent {

    private final RoomRepository roomRepository;

    @Data
    @Builder
    public static class CleaningDispatchTask {
        private UUID roomId;
        private Integer roomNumber;
        private String priorityTier; // URGENT, HIGH, REGULAR
        private String reason;
    }

    /**
     * Intelligent Housekeeping Dispatcher Agent:
     * Evaluates dirty room queues and arrival timelines to prioritize cleaning tasks automatically.
     */
    public List<CleaningDispatchTask> generateCleaningPriorityQueue(UUID propertyId) {
        log.info("Agent Executing Tool: generateCleaningPriorityQueue for property {}", propertyId);

        List<Room> dirtyRooms = roomRepository.findByPropertyPropertyIdAndStatus(propertyId, RoomStatus.DIRTY);
        List<CleaningDispatchTask> dispatchList = new ArrayList<>();

        for (Room room : dirtyRooms) {
            String priority = "REGULAR";
            String reason = "Routine departure turn-down cleaning.";

            // Suites and high-floor rooms get elevated priority
            if (room.getRoomType() != null && room.getRoomType().getName().toLowerCase().contains("suite")) {
                priority = "HIGH";
                reason = "Premium suite checkout turn-down.";
            }

            dispatchList.add(CleaningDispatchTask.builder()
                    .roomId(room.getRoomId())
                    .roomNumber(room.getRoomNumber())
                    .priorityTier(priority)
                    .reason(reason)
                    .build());
        }

        // Sort by priority (HIGH first)
        dispatchList.sort((a, b) -> b.getPriorityTier().compareTo(a.getPriorityTier()));
        return dispatchList;
    }
}
