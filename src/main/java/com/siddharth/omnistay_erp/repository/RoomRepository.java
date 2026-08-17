package com.siddharth.omnistay_erp.repository;

import com.siddharth.omnistay_erp.model.Room;
import com.siddharth.omnistay_erp.model.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {
    List<Room> findByPropertyPropertyId(UUID propertyId);
    List<Room> findByPropertyPropertyIdAndStatus(UUID propertyId, RoomStatus status);
    Optional<Room> findByPropertyPropertyIdAndRoomNumber(UUID propertyId, Integer roomNumber);
}