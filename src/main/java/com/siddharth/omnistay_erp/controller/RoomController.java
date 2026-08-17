package com.siddharth.omnistay_erp.controller;

import com.siddharth.omnistay_erp.model.Room;
import com.siddharth.omnistay_erp.model.RoomStatus;
import com.siddharth.omnistay_erp.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    public Room createRoom(@RequestBody Room room) {
        return roomService.createRoom(room);
    }

    @GetMapping
    public List<Room> getAllRooms() {
        return roomService.getAllRooms();
    }

    @GetMapping("/matrix")
    public List<Map<String, Object>> getRoomMatrix() {
        List<Room> rooms = roomService.getAllRooms();
        List<Map<String, Object>> matrix = new ArrayList<>();
        
        for (Room r : rooms) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getRoomId());
            map.put("roomId", r.getRoomId());
            map.put("roomNumber", r.getRoomNumber());
            map.put("roomType", r.getRoomType() != null ? r.getRoomType().getName() : "Standard Single");
            map.put("type", r.getRoomType() != null ? r.getRoomType().getName() : "Standard Single");
            map.put("status", r.getStatus() != null ? r.getStatus().name() : "AVAILABLE");
            map.put("dailyRate", r.getDailyRate());
            map.put("guest", null);
            map.put("amount", null);
            map.put("folioId", null);
            matrix.add(map);
        }
        return matrix;
    }

    @PutMapping("/{id}/status")
    public Room updateRoomStatus(@PathVariable UUID id, @RequestParam RoomStatus status) {
        return roomService.updateRoomStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void deleteRoom(@PathVariable UUID id) {
        roomService.deleteRoom(id);
    }
}