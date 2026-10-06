package com.cip.chatbot.controller;

import com.cip.chatbot.dto.ChatDtos.*;
import com.cip.chatbot.service.ChatService;
import com.cip.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
public class ChatBotController {

    private final ChatService chatService;

    @PostMapping("/session/start")
    public ApiResponse<SessionResponse> startSession(@RequestHeader("X-User-Id") Long userId,
                                                       @RequestBody StartSessionRequest request) {
        return ApiResponse.success(chatService.startSession(userId, request));
    }

    @PostMapping("/global/message")
    public ApiResponse<ChatResponse> globalMessage(@RequestHeader("X-User-Id") Long userId,
                                                    @RequestBody SendMessageRequest request) {
        return ApiResponse.success(chatService.sendMessage(userId, "GLOBAL", request));
    }

    @PostMapping("/interview/message")
    public ApiResponse<ChatResponse> interviewMessage(@RequestHeader("X-User-Id") Long userId,
                                                       @RequestBody SendMessageRequest request) {
        return ApiResponse.success(chatService.sendMessage(userId, "INTERVIEW", request));
    }

    @PostMapping("/job/message")
    public ApiResponse<ChatResponse> jobMessage(@RequestHeader("X-User-Id") Long userId,
                                                 @RequestBody SendMessageRequest request) {
        return ApiResponse.success(chatService.sendMessage(userId, "JOB", request));
    }

    @PostMapping("/certificate/message")
    public ApiResponse<ChatResponse> certificateMessage(@RequestHeader("X-User-Id") Long userId,
                                                         @RequestBody SendMessageRequest request) {
        return ApiResponse.success(chatService.sendMessage(userId, "CERTIFICATE", request));
    }

    @PostMapping("/analytics/message")
    public ApiResponse<ChatResponse> analyticsMessage(@RequestHeader("X-User-Id") Long userId,
                                                       @RequestBody SendMessageRequest request) {
        return ApiResponse.success(chatService.sendMessage(userId, "ANALYTICS", request));
    }

    @GetMapping("/session/{sessionId}/history")
    public ApiResponse<MessageHistoryResponse> getHistory(@PathVariable Long sessionId) {
        return ApiResponse.success(chatService.getHistory(sessionId));
    }

    @DeleteMapping("/session/{sessionId}")
    public ApiResponse<Void> endSession(@PathVariable Long sessionId) {
        chatService.endSession(sessionId);
        return ApiResponse.success("Session ended", null);
    }

    @GetMapping("/suggestions")
    public ApiResponse<SuggestionsResponse> getSuggestions(@RequestParam(defaultValue = "GLOBAL") String type) {
        return ApiResponse.success(chatService.getSuggestions(type));
    }

    @PostMapping("/feedback")
    public ApiResponse<Void> submitFeedback(@RequestBody FeedbackRequest request) {
        chatService.submitFeedback(request);
        return ApiResponse.success("Feedback recorded", null);
    }

    @GetMapping("/rate-limit")
    public ApiResponse<RateLimitInfo> getRateLimit(@RequestHeader("X-User-Id") Long userId) {
        return ApiResponse.success(chatService.getRateLimitInfo(userId));
    }

    @GetMapping("/health")
    public ApiResponse<Void> health() {
        return ApiResponse.success("Chatbot service is healthy", null);
    }
}
