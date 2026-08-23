package com.siddharth.omnistay.reservation.repository;

import com.siddharth.omnistay.reservation.entity.RoomStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomStatusRepository extends JpaRepository<RoomStatusEntity, String> {
}
