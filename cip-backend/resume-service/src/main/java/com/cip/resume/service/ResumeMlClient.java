package com.cip.resume.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Calls cip-ml for the two AI-writing steps of the resume builder. Falls back to the
 * original text (with a note) if cip-ml is unreachable, so the builder still works.
 */
@Slf4j
@Service
public class ResumeMlClient {

    private final RestTemplate restTemplate;
    private final String mlServiceUrl;

    public ResumeMlClient(RestTemplate restTemplate, @Value("${ml.service-url}") String mlServiceUrl) {
        this.restTemplate = restTemplate;
        this.mlServiceUrl = mlServiceUrl;
    }

    public String generateObjective(String branch, List<String> skills, String targetRole,
                                     List<String> achievements, Double cgpa) {
        try {
            Map<String, Object> body = Map.of(
                    "branch", branch != null ? branch : "",
                    "skills", skills != null ? skills : List.of(),
                    "target_role", targetRole != null ? targetRole : "Software Engineer",
                    "achievements", achievements != null ? achievements : List.of(),
                    "cgpa", cgpa != null ? cgpa : 0
            );
            Map<?, ?> response = restTemplate.postForObject(mlServiceUrl + "/ml/resume/generate-objective", body, Map.class);
            Object objective = response != null ? response.get("objective") : null;
            return objective != null ? objective.toString() : defaultObjective(branch, targetRole);
        } catch (RestClientException e) {
            log.warn("Objective generation failed: {}", e.getMessage());
            return defaultObjective(branch, targetRole);
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> improveText(String sectionType, String originalContent, String targetRole) {
        try {
            Map<String, Object> body = Map.of(
                    "section_type", sectionType,
                    "original_content", originalContent != null ? originalContent : "",
                    "target_role", targetRole != null ? targetRole : "Software Engineer"
            );
            Map<String, Object> response = restTemplate.postForObject(mlServiceUrl + "/ml/resume/improve-text", body, Map.class);
            return response != null ? response : fallbackImprove(originalContent);
        } catch (RestClientException e) {
            log.warn("Text improvement failed: {}", e.getMessage());
            return fallbackImprove(originalContent);
        }
    }

    private String defaultObjective(String branch, String targetRole) {
        return "Motivated " + (branch != null ? branch : "Computer Science") + " student seeking a "
                + (targetRole != null ? targetRole : "Software Engineer") + " role.";
    }

    private Map<String, Object> fallbackImprove(String originalContent) {
        return Map.of(
                "improved_content", originalContent != null ? originalContent : "",
                "keywords_added", List.of(),
                "action_verbs_used", List.of()
        );
    }
}
