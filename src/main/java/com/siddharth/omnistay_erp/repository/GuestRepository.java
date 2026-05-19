package com.siddharth.omnistay_erp.repository;

import com.siddharth.omnistay_erp.model.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface GuestRepository extends JpaRepository<Guest, UUID> {
    
}