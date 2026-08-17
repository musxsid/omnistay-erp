package com.siddharth.omnistay_erp.repository;

import com.siddharth.omnistay_erp.model.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GuestRepository extends JpaRepository<Guest, UUID> {
    List<Guest> findByPropertyPropertyId(UUID propertyId);
    Optional<Guest> findByPropertyPropertyIdAndEmail(UUID propertyId, String email);
}