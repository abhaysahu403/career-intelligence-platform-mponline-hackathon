package com.cip.resume.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Pulls the profile data the resume builder auto-fills from: student-service's general
 * profile (skills/certifications/experience) and academic profile (CGPA/marks/achievements),
 * plus certificate-service's validated certificates. Degrades to empty results on failure.
 */
@Slf4j
@Service
public class ProfileDataClient {

    private final RestTemplate restTemplate;
    private final String studentServiceUrl;
    private final String certificateServiceUrl;

    public ProfileDataClient(RestTemplate restTemplate,
                              @Value("${student.service-url}") String studentServiceUrl,
                              @Value("${certificate.service-url}") String certificateServiceUrl) {
        this.restTemplate = restTemplate;
        this.studentServiceUrl = studentServiceUrl;
        this.certificateServiceUrl = certificateServiceUrl;
    }

    public Map<String, Object> getStudentProfile(Long userId) {
        return getWrapped(studentServiceUrl + "/student/profile", userId);
    }

    public Map<String, Object> getAcademicProfile(Long userId) {
        return getWrapped(studentServiceUrl + "/student/academic", userId);
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getCertificates(Long userId) {
        try {
            Map<String, Object> response = restTemplate.getForObject(
                    certificateServiceUrl + "/certificates/user/" + userId + "?page=0&size=20", Map.class);
            Object certs = response != null ? response.get("certificates") : null;
            return certs instanceof List ? (List<Map<String, Object>>) certs : Collections.emptyList();
        } catch (RestClientException e) {
            log.warn("Failed to fetch certificates for userId={}: {}", userId, e.getMessage());
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getWrapped(String url, Long userId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", String.valueOf(userId));
            Map<String, Object> response = restTemplate.exchange(url, HttpMethod.GET,
                    new HttpEntity<>(headers), Map.class).getBody();
            Object data = response != null ? response.get("data") : null;
            return data instanceof Map ? (Map<String, Object>) data : Collections.emptyMap();
        } catch (RestClientException e) {
            log.warn("Failed to fetch {} for userId={}: {}", url, userId, e.getMessage());
            return Collections.emptyMap();
        }
    }
}
