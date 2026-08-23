package com.siddharth.omnistay.reservation.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "suites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuiteEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private String capacity;

    @Column(nullable = false)
    private String size;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String image;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "suite_gallery", joinColumns = @JoinColumn(name = "suite_id"))
    @Column(name = "gallery_url")
    private List<String> gallery;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "suite_amenities", joinColumns = @JoinColumn(name = "suite_id"))
    @Column(name = "amenity")
    private List<String> amenities;
}
