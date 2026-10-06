package com.cip.chatbot.service;

import com.cip.chatbot.dto.ChatDtos.*;
import com.cip.chatbot.entity.ChatMessage;
import com.cip.chatbot.entity.ChatSession;
import com.cip.chatbot.repository.ChatMessageRepository;
import com.cip.chatbot.repository.ChatSessionRepository;
import com.cip.common.exception.CipException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ChatService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final ChatMlClient mlClient;
    private final RateLimiter rateLimiter;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatService(ChatSessionRepository sessionRepository, ChatMessageRepository messageRepository,
                        ChatMlClient mlClient, RateLimiter rateLimiter) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.mlClient = mlClient;
        this.rateLimiter = rateLimiter;
    }

    @Transactional
    public SessionResponse startSession(Long userId, StartSessionRequest request) {
        ChatSession session = ChatSession.builder()
                .userId(userId)
                .sessionType(request.getSessionType() != null ? request.getSessionType() : "GLOBAL")
                .isActive(true)
                .contextJson(toJson(request.getContext()))
                .build();
        session = sessionRepository.save(session);
        return toSessionResponse(session);
    }

    @Transactional
    public ChatResponse sendMessage(Long userId, String sessionTypeOverride, SendMessageRequest request) {
        if (!rateLimiter.tryConsume(userId)) {
            throw new CipException("Rate limit exceeded. Please slow down and try again shortly.", 429);
        }

        String sessionType = sessionTypeOverride != null ? sessionTypeOverride
                : (request.getSessionType() != null ? request.getSessionType() : "GLOBAL");

        ChatSession session = resolveSession(userId, request.getSessionId(), sessionType, request.getContext());

        long start = System.currentTimeMillis();

        ChatMessage userMessage = ChatMessage.builder()
                .sessionId(session.getId())
                .role("USER")
                .content(request.getMessage())
                .messageType("TEXT")
                .build();
        messageRepository.save(userMessage);

        Map<String, Object> context = request.getContext();
        Map<String, Object> mlResult = mlClient.getResponse(request.getMessage(), sessionType, context);
        String reply = String.valueOf(mlResult.getOrDefault("reply", "I'm not sure how to respond to that."));
        @SuppressWarnings("unchecked")
        List<String> suggestions = (List<String>) mlResult.getOrDefault("suggestions", List.of());

        ChatMessage assistantMessage = ChatMessage.builder()
                .sessionId(session.getId())
                .role("ASSISTANT")
                .content(reply)
                .messageType("TEXT")
                .build();
        assistantMessage = messageRepository.save(assistantMessage);

        return ChatResponse.builder()
                .success(true)
                .message(reply)
                .sessionId(session.getId())
                .messageId(assistantMessage.getId())
                .suggestions(suggestions)
                .responseTimeMs(System.currentTimeMillis() - start)
                .build();
    }

    private ChatSession resolveSession(Long userId, Long sessionId, String sessionType, Map<String, Object> context) {
        if (sessionId != null) {
            return sessionRepository.findById(sessionId)
                    .orElseThrow(() -> CipException.notFound("Chat session"));
        }
        ChatSession session = ChatSession.builder()
                .userId(userId)
                .sessionType(sessionType)
                .isActive(true)
                .contextJson(toJson(context))
                .build();
        return sessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public MessageHistoryResponse getHistory(Long sessionId) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> CipException.notFound("Chat session"));
        List<MessageDto> messages = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId).stream()
                .map(m -> MessageDto.builder()
                        .id(m.getId())
                        .role(m.getRole())
                        .content(m.getContent())
                        .messageType(m.getMessageType())
                        .createdAt(m.getCreatedAt())
                        .metadata(fromJson(m.getMetadataJson()))
                        .build())
                .collect(Collectors.toList());
        return MessageHistoryResponse.builder()
                .sessionId(sessionId)
                .messages(messages)
                .totalMessages(messages.size())
                .sessionType(session.getSessionType())
                .build();
    }

    @Transactional
    public void endSession(Long sessionId) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> CipException.notFound("Chat session"));
        session.setIsActive(false);
        sessionRepository.save(session);
    }

    public SuggestionsResponse getSuggestions(String sessionType) {
        return SuggestionsResponse.builder()
                .sessionType(sessionType)
                .suggestions(canned(sessionType))
                .build();
    }

    private List<String> canned(String sessionType) {
        return switch (sessionType != null ? sessionType : "GLOBAL") {
            case "INTERVIEW" -> List.of(
                    "How do I improve my interview score?",
                    "What topics should I practice next?",
                    "Can you explain my last feedback?"
            );
            case "JOB" -> List.of(
                    "Which jobs match my skills best?",
                    "How is the match percentage calculated?",
                    "What skills am I missing for top roles?"
            );
            case "CERTIFICATE" -> List.of(
                    "How does certificate validation work?",
                    "Why was my certificate flagged?",
                    "What certifications should I add next?"
            );
            case "ANALYTICS" -> List.of(
                    "What does my readiness score mean?",
                    "What are my weakest skills right now?",
                    "How do I raise my readiness score?"
            );
            default -> List.of(
                    "What should I do next to get job ready?",
                    "How does this platform work?",
                    "What's my current readiness score?"
            );
        };
    }

    @Transactional
    public void submitFeedback(FeedbackRequest request) {
        ChatMessage message = messageRepository.findById(request.getMessageId())
                .orElseThrow(() -> CipException.notFound("Message"));
        message.setRating(request.getRating());
        message.setFeedbackType(request.getFeedbackType());
        message.setFeedbackComment(request.getComment());
        messageRepository.save(message);
    }

    public RateLimitInfo getRateLimitInfo(Long userId) {
        return rateLimiter.getInfo(userId);
    }

    private SessionResponse toSessionResponse(ChatSession session) {
        return SessionResponse.builder()
                .sessionId(session.getId())
                .sessionType(session.getSessionType())
                .startedAt(session.getStartedAt())
                .isActive(session.getIsActive())
                .context(fromJson(session.getContextJson()))
                .build();
    }

    private String toJson(Map<String, Object> map) {
        if (map == null) return null;
        try {
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize chat context/metadata: {}", e.getMessage());
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fromJson(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            log.warn("Failed to deserialize chat context/metadata: {}", e.getMessage());
            return null;
        }
    }
}
