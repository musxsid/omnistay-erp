package com.siddharth.omnistay.reservation.repository;

import com.siddharth.omnistay.reservation.entity.SpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpaRepository extends JpaRepository<SpaEntity, String> {
}
