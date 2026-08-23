package com.siddharth.omnistay.reservation.repository;

import com.siddharth.omnistay.reservation.entity.BookingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, String> {
}
