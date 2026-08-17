package com.siddharth.omnistay_erp.ai;

import com.siddharth.omnistay_erp.dto.ReservationRequestDTO;
import com.siddharth.omnistay_erp.dto.ReservationResponseDTO;
import com.siddharth.omnistay_erp.model.Room;
import com.siddharth.omnistay_erp.model.RoomStatus;
import com.siddharth.omnistay_erp.repository.RoomRepository;
import com.siddharth.omnistay_erp.service.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FrontDeskAgent {

    private final RoomRepository roomRepository;
    private final ReservationService reservationService;

    /**
     * Agent Tool 1: Searches available rooms for a given property.
     */
    public List<Map<String, Object>> searchAvailableRoomsTool(UUID propertyId) {
        log.info("Agent Executing Tool: searchAvailableRoomsTool for property {}", propertyId);
        List<Room> rooms = roomRepository.findByPropertyPropertyIdAndStatus(propertyId, RoomStatus.AVAILABLE);
        return rooms.stream().map(r -> Map.<String, Object>of(
                "roomId", r.getRoomId(),
                "roomNumber", r.getRoomNumber(),
                "roomType", r.getRoomType() != null ? r.getRoomType().getName() : "Standard Suite",
                "dailyRate", r.getDailyRate()
        )).collect(Collectors.toList());
    }

    /**
     * Agent Tool 2: Executes natural language multi-step booking.
     */
    public ReservationResponseDTO executeBookingTool(ReservationRequestDTO bookingRequest) {
        log.info("Agent Executing Tool: executeBookingTool for guest {}", bookingRequest.getGuestName());
        return reservationService.createReservation(bookingRequest);
    }
}
