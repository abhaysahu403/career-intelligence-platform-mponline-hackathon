package com.cip.recommendation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String platform;

    @Column(nullable = false)
    private String platformType; // GOVERNMENT, INTERNATIONAL, INDIAN, PAID

    @Column(nullable = false)
    private String url;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]", nullable = false)
    private String[] skillsCovered;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]", nullable = false)
    private String[] branches;

    private Integer durationWeeks;

    @Column(nullable = false)
    private String cost;

    @Builder.Default
    private boolean certification = false;

    private String certificationBody;

    @Column(nullable = false)
    private String difficulty; // BEGINNER, INTERMEDIATE, ADVANCED

    private Double rating;

    @Builder.Default
    private boolean governmentRecognized = false;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private String[] tags;

    @Builder.Default
    private boolean active = true;

    private LocalDateTime createdAt;
}
