package com.cip.recommendation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "career_targets")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CareerTarget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String targetCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String targetType; // PRIVATE_TECH, GOVERNMENT, PSU, BANKING, DEFENCE, HIGHER_STUDIES, ENTREPRENEURSHIP

    private Double minCgpa;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]", nullable = false)
    private String[] requiredSkills;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private String[] preferredSkills;

    private Integer interviewRounds;
    private Double avgPackageLpa;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private String[] hiringMonths;

    @Column(nullable = false)
    private Integer readinessRequired;

    @Column(nullable = false)
    private Integer preparationWeeks;

    @Builder.Default
    private boolean active = true;
}
