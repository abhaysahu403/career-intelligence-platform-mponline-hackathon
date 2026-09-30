package com.cip.student.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_academic_profiles")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AcademicProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    private String collegeName;
    private String branch;
    private Integer yearOfStudy;
    private Integer graduationYear;
    private Double currentCgpa;
    private Double tenthPercentage;
    private String tenthBoard;
    private Double twelfthPercentage;
    private String twelfthStream;

    @Builder.Default
    private Integer activeBacklogs = 0;

    @Builder.Default
    private boolean gapYear = false;

    @Builder.Default
    private Integer internshipsCount = 0;

    @Builder.Default
    private Integer hackathonWins = 0;

    private String targetRoleType;

    @Builder.Default
    private boolean willingToRelocate = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
