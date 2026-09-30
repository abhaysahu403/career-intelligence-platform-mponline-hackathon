package com.cip.recommendation.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;

/**
 * Aggregates the current-student-profile data Campus-to-Corporate needs from
 * student-service and score-service. Each call degrades to an empty map on failure
 * so a single unreachable service doesn't break the whole gap analysis.
 */
@Slf4j
@Service
public class ProfileClient {

    private final RestTemplate restTemplate;
    private final String studentServiceUrl;
    private final String scoreServiceUrl;

    public ProfileClient(RestTemplate restTemplate,
                          @Value("${student.service-url}") String studentServiceUrl,
                          @Value("${score.service-url}") String scoreServiceUrl) {
        this.restTemplate = restTemplate;
        this.studentServiceUrl = studentServiceUrl;
        this.scoreServiceUrl = scoreServiceUrl;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getAcademicProfile(Long userId) {
        return get(studentServiceUrl + "/student/academic", userId);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getStudentProfile(Long userId) {
        return get(studentServiceUrl + "/student/profile", userId);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getScore(Long userId) {
        return get(scoreServiceUrl + "/score", userId);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> get(String url, Long userId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", String.valueOf(userId));
            Map<String, Object> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET,
                    new HttpEntity<>(headers), Map.class).getBody();
            Object data = response != null ? response.get("data") : null;
            return data instanceof Map ? (Map<String, Object>) data : Collections.emptyMap();
        } catch (RestClientException e) {
            log.warn("Failed to fetch {} for userId={}: {}", url, userId, e.getMessage());
            return Collections.emptyMap();
        }
    }
}
