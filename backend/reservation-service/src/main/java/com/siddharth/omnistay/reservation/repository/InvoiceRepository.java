package com.siddharth.omnistay.reservation.repository;

import com.siddharth.omnistay.reservation.entity.InvoiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceRepository extends JpaRepository<InvoiceEntity, String> {
}
