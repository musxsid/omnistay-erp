package com.siddharth.omnistay_erp.service;

import com.siddharth.omnistay_erp.model.Folio;
import com.siddharth.omnistay_erp.model.Guest;
import com.siddharth.omnistay_erp.repository.GuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class GuestService {

    private final GuestRepository guestRepository;

    @Transactional
    public Guest checkInGuest(Guest newGuest) {
        // 1. Create a brand new digital bill (Folio)
        Folio newFolio = new Folio();
        newFolio.setCheckInDate(LocalDateTime.now());
        newFolio.setSettled(false);
        newFolio.setTotalDue(0.0);

        // 2. THE HANDSHAKE: Link the Folio to the Guest
        newGuest.setActiveFolio(newFolio);

        // 3. Save the Guest. Because we used CascadeType.PERSIST in our Model, 
        // Spring Boot will automatically save the attached Folio to the database too!
        return guestRepository.save(newGuest);
    }
}