package com.cip.job.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "government_jobs")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GovernmentJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // GOV001, GOV002, ...

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String organization;

    @Column(nullable = false)
    private String category; // CENTRAL_GOVT, STATE_GOVT, PSU, BANKING, RAILWAY, DEFENCE

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]", nullable = false)
    private String[] eligibleBranches; // e.g. {CSE,IT,ECE} or {ALL}

    private Double minCgpa;
    private String examName;

    @Column(nullable = false)
    private String applicationLink;

    private String examCycle; // descriptive, not an exact date
    private String salary;

    @Column(columnDefinition = "TEXT")
    private String eligibility;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private String[] tags;

    @Builder.Default
    private boolean active = true;

    private LocalDateTime createdAt;
}
