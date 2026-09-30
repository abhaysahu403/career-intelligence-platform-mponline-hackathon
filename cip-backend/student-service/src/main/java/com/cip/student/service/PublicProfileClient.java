package com.cip.student.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class PublicProfileClient {

    private final RestTemplate restTemplate;
    private final String scoreServiceUrl;
    private final String certificateServiceUrl;

    public PublicProfileClient(RestTemplate restTemplate,
                                @Value("${score.service-url}") String scoreServiceUrl,
                                @Value("${certificate.service-url}") String certificateServiceUrl) {
        this.restTemplate = restTemplate;
        this.scoreServiceUrl = scoreServiceUrl;
        this.certificateServiceUrl = certificateServiceUrl;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getScore(Long userId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", userId.toString());
            var response = restTemplate.exchange(
                    scoreServiceUrl + "/score",
                    org.springframework.http.HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class);
            Map<String, Object> body = response.getBody();
            return body != null ? (Map<String, Object>) body.getOrDefault("data", Collections.emptyMap()) : Collections.emptyMap();
        } catch (RestClientException e) {
            log.warn("Failed to fetch score for userId={}: {}", userId, e.getMessage());
            return Collections.emptyMap();
        }
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getValidatedCertificates(Long userId) {
        try {
            Map<String, Object> response = restTemplate.getForObject(
                    certificateServiceUrl + "/certificates/user/" + userId + "?page=0&size=20",
                    Map.class);
            if (response == null) return Collections.emptyList();
            List<Map<String, Object>> certificates = (List<Map<String, Object>>) response.getOrDefault("certificates", Collections.emptyList());
            return certificates.stream()
                    .filter(c -> "COMPLETED".equals(c.get("status")))
                    .toList();
        } catch (RestClientException e) {
            log.warn("Failed to fetch certificates for userId={}: {}", userId, e.getMessage());
            return Collections.emptyList();
        }
    }
}
