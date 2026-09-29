package com.cip.interview.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "facial_analytics")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FacialAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long interviewId;

    private Double confidenceScore;
    private String eyeContact; // GOOD, AVERAGE, POOR
    private String emotion;
    private String posture; // STABLE, UNSTABLE
    private Double voiceClarity;

    @CreationTimestamp
    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;
}
