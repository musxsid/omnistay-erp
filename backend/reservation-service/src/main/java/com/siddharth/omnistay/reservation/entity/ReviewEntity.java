package com.siddharth.omnistay.reservation.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewEntity {
    @Id
    private String id;

    @Column(name = "guest_name", nullable = false)
    private String guestName;

    private String location;

    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "review_date")
    private String reviewDate;
}
