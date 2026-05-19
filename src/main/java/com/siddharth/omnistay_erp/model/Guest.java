package com.siddharth.omnistay_erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "guests")
@Data
public class Guest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID guestId;

    private String fullName;
    private String email;
    
    @OneToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "active_folio_id",referencedColumnName = "folioId")
    private Folio activeFolio;

}