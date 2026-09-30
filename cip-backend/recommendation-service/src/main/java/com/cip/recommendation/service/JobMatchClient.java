package com.cip.recommendation.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

/**
 * Real "jobs match" counts for the Campus-to-Corporate metric card — reuses the
 * government eligibility endpoint (Module 1) and falls back to 0 if job-service
 * is unreachable, rather than fabricating a number.
 */
@Slf4j
@Service
public class JobMatchClient {

    private final RestTemplate restTemplate;
    private final String jobServiceUrl;

    public JobMatchClient(RestTemplate restTemplate, @Value("${job.service-url}") String jobServiceUrl) {
        this.restTemplate = restTemplate;
        this.jobServiceUrl = jobServiceUrl;
    }

    @SuppressWarnings("unchecked")
    public long getGovernmentEligibleCount(String branch, Double cgpa) {
        if (branch == null || cgpa == null) return 0;
        try {
            String url = UriComponentsBuilder.fromHttpUrl(jobServiceUrl + "/jobs/government/eligible-count")
                    .queryParam("branch", branch).queryParam("cgpa", cgpa).toUriString();
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            Object data = response != null ? response.get("data") : null;
            if (data instanceof Map<?, ?> map && map.get("eligibleCount") instanceof Number n) {
                return n.longValue();
            }
            return 0;
        } catch (RestClientException e) {
            log.warn("Failed to fetch government eligible count: {}", e.getMessage());
            return 0;
        }
    }

    @SuppressWarnings("unchecked")
    public long getPrivateJobsCount() {
        try {
            Map<String, Object> response = restTemplate.getForObject(jobServiceUrl + "/jobs?page=0&size=1", Map.class);
            Object data = response != null ? response.get("data") : null;
            if (data instanceof Map<?, ?> page && page.get("totalElements") instanceof Number n) {
                return n.longValue();
            }
            return 0;
        } catch (RestClientException e) {
            log.warn("Failed to fetch private jobs count: {}", e.getMessage());
            return 0;
        }
    }
}
