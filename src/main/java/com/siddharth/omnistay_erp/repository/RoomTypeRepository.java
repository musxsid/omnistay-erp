package com.siddharth.omnistay_erp.repository;

import com.siddharth.omnistay_erp.model.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, UUID> {
    List<RoomType> findByPropertyPropertyId(UUID propertyId);
    Optional<RoomType> findByPropertyPropertyIdAndCode(UUID propertyId, String code);
}
