package com.siddharth.omnistay.reservation.repository;

import com.siddharth.omnistay.reservation.entity.DiningEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiningRepository extends JpaRepository<DiningEntity, String> {
}
