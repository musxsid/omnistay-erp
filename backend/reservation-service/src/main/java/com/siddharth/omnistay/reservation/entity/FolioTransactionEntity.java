package com.siddharth.omnistay.reservation.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "folio_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FolioTransactionEntity {

    @Id
    private String id;

    @Column(name = "room_number", nullable = false)
    private String roomNumber;

    @Column(name = "transaction_date", nullable = false)
    private String transactionDate;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "department_code", nullable = false)
    private String departmentCode;

    @Column(name = "guest_name", nullable = false)
    private String guestName;
}
