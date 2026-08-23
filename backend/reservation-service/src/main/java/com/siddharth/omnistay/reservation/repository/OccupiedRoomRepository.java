package com.siddharth.omnistay.reservation.repository;

import com.siddharth.omnistay.reservation.entity.OccupiedRoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OccupiedRoomRepository extends JpaRepository<OccupiedRoomEntity, String> {
}
