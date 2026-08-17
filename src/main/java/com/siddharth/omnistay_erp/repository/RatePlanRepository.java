package com.siddharth.omnistay_erp.repository;

import com.siddharth.omnistay_erp.model.RatePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RatePlanRepository extends JpaRepository<RatePlan, UUID> {
    List<RatePlan> findByPropertyPropertyIdAndIsActiveTrue(UUID propertyId);
    Optional<RatePlan> findByPropertyPropertyIdAndCode(UUID propertyId, String code);
}
