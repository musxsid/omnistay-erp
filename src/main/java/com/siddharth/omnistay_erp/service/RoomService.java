package com.siddharth.omnistay_erp.service;

import com.siddharth.omnistay_erp.model.Room;
import com.siddharth.omnistay_erp.model.RoomStatus;
import com.siddharth.omnistay_erp.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor // Handles injection of final fields automatically
public class RoomService {

    private final RoomRepository roomRepository;

    @Transactional // Ensures the room is saved completely or not at all
    public Room createRoom(Room room) {
        return roomRepository.save(room);
    }

    @Transactional(readOnly = true) // Optimization for read-only operations
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    @Transactional
    public Room updateRoomStatus(UUID id, RoomStatus newStatus) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        room.setStatus(newStatus);
        return roomRepository.save(room);
    }

    @Transactional
    public void deleteRoom(UUID id) {
        // Architecture Check: Ensure room isn't occupied before deleting
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        if (room.getStatus() == RoomStatus.OCCUPIED) {
             throw new IllegalStateException("Cannot delete an occupied room!");
        }
        
        roomRepository.deleteById(id);
    }
}