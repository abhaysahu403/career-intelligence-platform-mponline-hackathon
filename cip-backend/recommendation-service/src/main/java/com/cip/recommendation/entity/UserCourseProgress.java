package com.cip.recommendation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_course_progress")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserCourseProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long courseId;

    @Builder.Default
    private String status = "SAVED"; // SAVED, IN_PROGRESS, COMPLETED

    private LocalDateTime savedAt;
    private LocalDateTime updatedAt;
}
