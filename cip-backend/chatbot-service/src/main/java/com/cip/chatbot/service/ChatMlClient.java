package com.cip.chatbot.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Wraps calls to cip-ml's /ml/chatbot/respond. Falls back to a deterministic reply on
 * failure so the chat widget keeps working even if cip-ml or the Gemini key is down —
 * same pattern as interview-service's MlClient.
 */
@Slf4j
@Service
public class ChatMlClient {

    private final RestTemplate restTemplate;
    private final String mlServiceUrl;

    public ChatMlClient(RestTemplate restTemplate, @Value("${ml.service-url}") String mlServiceUrl) {
        this.restTemplate = restTemplate;
        this.mlServiceUrl = mlServiceUrl;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getResponse(String message, String sessionType, Map<String, Object> context) {
        try {
            Map<String, Object> body = Map.of(
                    "message", message != null ? message : "",
                    "session_type", sessionType != null ? sessionType : "GLOBAL",
                    "context", context != null ? context : Map.of()
            );
            return restTemplate.postForObject(mlServiceUrl + "/ml/chatbot/respond", body, Map.class);
        } catch (RestClientException e) {
            log.warn("ML chatbot response failed, using fallback: {}", e.getMessage());
            return Map.of(
                    "reply", "I'm having trouble reaching the AI assistant right now. Please try again in a moment.",
                    "suggestions", List.of()
            );
        }
    }
}
