package com.cip.recommendation.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Thin pass-through to cip-ml's /ml/career-path/discover — the frontend must never
 * call cip-ml directly, so this service just forwards the quiz payload and returns
 * whatever cip-ml computed (deterministic scoring + optional Gemini-enriched reasoning).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CareerPathClient {

    private final RestTemplate restTemplate;

    @Value("${ml.service-url:http://localhost:8000}")
    private String mlServiceUrl;

    @SuppressWarnings("unchecked")
    public Map<String, Object> discover(String branch, List<String> interests, List<Map<String, Object>> aptitudeAnswers) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            // cip-ml (Python) expects snake_case keys; the Java/TS side stays camelCase.
            List<Map<String, Object>> snakeCaseAnswers = (aptitudeAnswers != null ? aptitudeAnswers : List.<Map<String, Object>>of())
                    .stream()
                    .map(a -> {
                        Map<String, Object> m = new LinkedHashMap<>();
                        m.put("question_id", a.get("questionId"));
                        m.put("selected_option", a.get("selectedOption"));
                        return m;
                    })
                    .toList();
            Map<String, Object> body = Map.of(
                    "branch", branch != null ? branch : "",
                    "interests", interests != null ? interests : List.of(),
                    "aptitude_answers", snakeCaseAnswers
            );
            ResponseEntity<Map> response = restTemplate.exchange(
                    mlServiceUrl + "/ml/career-path/discover",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class
            );
            return response.getBody() != null ? response.getBody() : Map.of("tracks", List.of());
        } catch (Exception e) {
            log.warn("Career path discovery failed, cip-ml unreachable: {}", e.getMessage());
            return Map.of("tracks", List.of());
        }
    }
}
