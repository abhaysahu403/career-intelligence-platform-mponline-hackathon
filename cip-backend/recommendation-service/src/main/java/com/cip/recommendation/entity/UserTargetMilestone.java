package com.cip.recommendation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_target_milestones")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserTargetMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String targetCode;

    @Column(nullable = false)
    private Integer milestoneIndex;

    @Builder.Default
    private boolean completed = false;

    private LocalDateTime completedAt;
}
