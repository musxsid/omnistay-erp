package com.siddharth.omnistay_erp.repository;

import com.siddharth.omnistay_erp.model.FolioTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FolioTransactionRepository extends JpaRepository<FolioTransaction, UUID> {
    List<FolioTransaction> findByFolioFolioIdOrderByCreatedAtAsc(UUID folioId);

    @Query("SELECT COALESCE(SUM(ft.amount), 0) FROM FolioTransaction ft WHERE ft.folio.folioId = :folioId AND ft.transactionType = 'DEBIT' AND ft.isVoided = false")
    java.math.BigDecimal sumDebitsByFolioId(@Param("folioId") UUID folioId);

    @Query("SELECT COALESCE(SUM(ft.amount), 0) FROM FolioTransaction ft WHERE ft.folio.folioId = :folioId AND ft.transactionType = 'CREDIT' AND ft.isVoided = false")
    java.math.BigDecimal sumCreditsByFolioId(@Param("folioId") UUID folioId);
}
