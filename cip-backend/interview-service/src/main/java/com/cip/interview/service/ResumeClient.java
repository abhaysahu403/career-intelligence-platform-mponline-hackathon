package com.cip.interview.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Wraps a read-only call to resume-service so interview question generation can be
 * grounded in the candidate's actual resume. Fails soft to an empty skills list on
 * any error (no resume uploaded yet, service down, parse failure) — RESUME_BASED
 * interviews must keep working even without this data.
 */
@Slf4j
@Service
public class ResumeClient {

    private final RestTemplate restTemplate;
    private final String resumeServiceUrl;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ResumeClient(RestTemplate restTemplate, @Value("${resume.service-url}") String resumeServiceUrl) {
        this.restTemplate = restTemplate;
        this.resumeServiceUrl = resumeServiceUrl;
    }

    @SuppressWarnings("unchecked")
    public List<String> getLatestResumeSkills(Long userId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", String.valueOf(userId));
            ResponseEntity<Map> response = restTemplate.exchange(
                    resumeServiceUrl + "/resume/latest", HttpMethod.GET, new HttpEntity<>(headers), Map.class);

            Map<String, Object> body = response.getBody();
            if (body == null) return List.of();
            Map<String, Object> resume = (Map<String, Object>) body.get("data");
            if (resume == null) return List.of();
            Object parsedDataRaw = resume.get("parsedData");
            if (!(parsedDataRaw instanceof String parsedDataJson) || parsedDataJson.isBlank()) return List.of();

            Map<String, Object> parsedData = objectMapper.readValue(parsedDataJson, Map.class);
            Object skillsRaw = parsedData.get("skills");
            if (!(skillsRaw instanceof List<?> skillsList)) return List.of();

            List<String> skills = new ArrayList<>();
            for (Object skill : skillsList) {
                if (skill != null && !skill.toString().isBlank()) skills.add(skill.toString());
            }
            return skills;
        } catch (Exception e) {
            log.warn("Could not fetch resume skills for userId={}, proceeding without them: {}", userId, e.getMessage());
            return List.of();
        }
    }
}
