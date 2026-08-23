package com.siddharth.omnistay.reservation.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "room_statuses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomStatusEntity {

    @Id
    @Column(name = "room_number")
    private String roomNumber;

    @Column(name = "cleaning_status", nullable = false)
    private String cleaningStatus;
}
