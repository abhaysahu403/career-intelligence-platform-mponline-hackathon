package com.cip.interview.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class InterviewV3Dtos {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class StartRequest {
        private String interviewMode; // RESUME_BASED, COMPANY_SPECIFIC, ROLE_BASED, BRANCH_BASED, TIME_BASED
        private String company;
        private String role;
        private String branch;
        private Integer duration;
        private String difficulty;
        private String persona;
        private String roundType;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QuestionDto {
        private String question;
        private String topic;
        private String difficulty;
        private String ideal;
        private String source; // company_bank, branch_bank, ai_generated, fallback
        private String company;
        private String branch;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AnswerEntryDto {
        private Integer questionIndex;
        private String question;
        private String answer;
        private Long timeTakenSeconds;
        private Double score;
        private String topic;
        private String difficulty;
        private Object feedback;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SessionResponse {
        private Long id;
        private Long userId;
        private String interviewMode;
        private String company;
        private String role;
        private String branch;
        private Integer duration;
        private String difficulty;
        private String persona;
        private String roundType;
        private String status;
        private List<QuestionDto> questions;
        private List<AnswerEntryDto> answers;
        private Double totalScore;
        private Integer totalQuestions;
        private Integer answeredQuestions;
        private LocalDateTime startedAt;
        private LocalDateTime completedAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SubmitAndEvaluateRequest {
        private Integer questionIndex;
        private String question;
        private String answer;
        private String topic;
        private String ideal;
        private Long timeTaken;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SubmitAnswerRequest {
        private Long interviewId;
        private Integer questionIndex;
        private String answer;
        private Long timeTaken;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class FacialAnalyticsRequest {
        private Long interviewId;
        private Double confidenceScore;
        private String eyeContact;
        private String emotion;
        private String posture;
        private Double voiceClarity;
    }
}
