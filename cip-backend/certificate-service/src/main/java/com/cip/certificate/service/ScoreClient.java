package com.cip.certificate.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
public class ScoreClient {

    private final RestTemplate restTemplate;
    private final String scoreServiceUrl;

    public ScoreClient(RestTemplate restTemplate, @Value("${score.service-url}") String scoreServiceUrl) {
        this.restTemplate = restTemplate;
        this.scoreServiceUrl = scoreServiceUrl;
    }

    public void pushCertificationScore(Long userId, double certificationsScore) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Role", "ADMIN");
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> body = Map.of(
                    "userId", userId,
                    "certificationsScore", certificationsScore
            );
            restTemplate.postForObject(scoreServiceUrl + "/score/update", new HttpEntity<>(body, headers), Object.class);
        } catch (RestClientException e) {
            log.warn("Failed to push certification score to score-service for userId={}: {}", userId, e.getMessage());
        }
    }
}
