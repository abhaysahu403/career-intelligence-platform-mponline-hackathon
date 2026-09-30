package com.cip.resume.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "generated_resumes")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GeneratedResume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private String templateId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contentJson;

    @Column(nullable = false)
    private Integer atsScore;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String atsFeedback;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
