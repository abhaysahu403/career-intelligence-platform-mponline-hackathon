package com.cip.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ChatDtos {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class StartSessionRequest {
        private String sessionType;
        private Map<String, Object> context;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SessionResponse {
        private Long sessionId;
        private String sessionType;
        private LocalDateTime startedAt;
        private Boolean isActive;
        private Map<String, Object> context;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SendMessageRequest {
        private String message;
        private Long sessionId;
        private String sessionType;
        private Map<String, Object> context;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ChatResponse {
        private boolean success;
        private String message;
        private Long sessionId;
        private Long messageId;
        private List<String> suggestions;
        private Map<String, Object> metadata;
        private Integer tokensUsed;
        private Long responseTimeMs;
        private LocalDateTime timestamp;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MessageDto {
        private Long id;
        private String role;
        private String content;
        private String messageType;
        private LocalDateTime createdAt;
        private Map<String, Object> metadata;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MessageHistoryResponse {
        private Long sessionId;
        private List<MessageDto> messages;
        private long totalMessages;
        private String sessionType;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SuggestionsResponse {
        private String sessionType;
        private List<String> suggestions;
        private Map<String, Object> context;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class FeedbackRequest {
        private Long messageId;
        private Integer rating;
        private String feedbackType;
        private String comment;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RateLimitInfo {
        private int remainingPerMinute;
        private int remainingPerHour;
        private int remainingPerDay;
        private int limitPerMinute;
        private int limitPerHour;
        private int limitPerDay;
    }
}
