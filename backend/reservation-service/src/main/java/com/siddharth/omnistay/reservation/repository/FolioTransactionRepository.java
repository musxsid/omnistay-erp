package com.siddharth.omnistay.reservation.repository;

import com.siddharth.omnistay.reservation.entity.FolioTransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FolioTransactionRepository extends JpaRepository<FolioTransactionEntity, String> {
    List<FolioTransactionEntity> findByRoomNumber(String roomNumber);
    void deleteByRoomNumber(String roomNumber);
}
