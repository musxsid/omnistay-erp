package com.siddharth.omnistay_erp.repository;

import com.siddharth.omnistay_erp.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PropertyRepository extends JpaRepository<Property, UUID> {
    Optional<Property> findByPropertyCode(String propertyCode);
}
