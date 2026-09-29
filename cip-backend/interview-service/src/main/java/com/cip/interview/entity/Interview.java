package com.cip.interview.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "interviews")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private InterviewType type = InterviewType.TECHNICAL;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private InterviewStatus status = InterviewStatus.IN_PROGRESS;

    private String jobRole; // context: "Backend Engineer", "Data Scientist", etc.

    // ─── V3 session fields ──────────────────────────────────────────────────
    private String interviewMode; // RESUME_BASED, COMPANY_SPECIFIC, ROLE_BASED, BRANCH_BASED, TIME_BASED
    private String company;
    private String branch;
    private Integer duration; // minutes
    private String difficulty; // EASY, MEDIUM, HARD, FAANG
    private String persona; // FRIENDLY_HR, STRICT_TECHNICAL, ...
    private String roundType; // TECHNICAL, HR, BEHAVIORAL

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String questions; // List of question objects as JSON string

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String answers; // List of answer objects with scores as JSON string

    private Double totalScore;   // 0-100
    private Integer totalQuestions;
    private Integer answeredQuestions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String feedback; // Detailed ML feedback per question as JSON string

    @CreationTimestamp
    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum InterviewType {
        TECHNICAL, BEHAVIORAL, HR, DSA
    }

    public enum InterviewStatus {
        IN_PROGRESS, COMPLETED, ABANDONED
    }
}
