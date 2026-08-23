package com.siddharth.omnistay.reservation.repository;

import com.siddharth.omnistay.reservation.entity.SuiteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SuiteRepository extends JpaRepository<SuiteEntity, String> {
}
