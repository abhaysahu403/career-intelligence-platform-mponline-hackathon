package com.cip.student.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Pushes academic/certifications/experience scores to score-service so the readiness
 * formula stays current whenever a student updates their academic profile. Score-service's
 * /score/update endpoint is normally admin/internal-only (Kafka event driven in the original
 * design) — since Kafka isn't running in this deployment, this calls it directly instead,
 * marking the request as an internal ADMIN call via X-User-Role.
 */
@Slf4j
@Service
public class ScoreClient {

    private final RestTemplate restTemplate;
    private final String scoreServiceUrl;

    public ScoreClient(RestTemplate restTemplate, @Value("${score.service-url}") String scoreServiceUrl) {
        this.restTemplate = restTemplate;
        this.scoreServiceUrl = scoreServiceUrl;
    }

    public void pushAcademicScores(Long userId, double academicScore, double certificationsScore, double experienceScore) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Role", "ADMIN");
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            Map<String, Object> body = Map.of(
                    "userId", userId,
                    "academicScore", academicScore,
                    "certificationsScore", certificationsScore,
                    "experienceScore", experienceScore
            );
            restTemplate.postForObject(scoreServiceUrl + "/score/update", new HttpEntity<>(body, headers), Object.class);
        } catch (RestClientException e) {
            log.warn("Failed to push academic score to score-service for userId={}: {}", userId, e.getMessage());
        }
    }
}
