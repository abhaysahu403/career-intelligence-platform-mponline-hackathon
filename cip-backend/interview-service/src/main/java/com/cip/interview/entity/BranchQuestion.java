package com.cip.interview.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "branch_questions")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BranchQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String branch;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String difficulty; // EASY, MEDIUM, HARD

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @Column(columnDefinition = "TEXT")
    private String idealAnswer;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private String[] tags;

    @Column(updatable = false)
    private LocalDateTime createdAt;
}
