package com.siddharth.omnistay_erp.repository;

import com.siddharth.omnistay_erp.model.Folio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FolioRepository extends JpaRepository<Folio, UUID> {
    Optional<Folio> findByReservationReservationId(UUID reservationId);
    List<Folio> findByPropertyPropertyIdAndIsSettledFalse(UUID propertyId);
}
