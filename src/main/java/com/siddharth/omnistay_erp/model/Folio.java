package com.siddharth.omnistay_erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "folios")
@Data
public class Folio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID folioId;

    private LocalDateTime checkInDate;
    
    private LocalDateTime checkOutDate;

    private boolean isSettled = false; 

    private Double totalDue = 0.0;
}