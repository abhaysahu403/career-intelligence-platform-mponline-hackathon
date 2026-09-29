package com.cip.interview.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Wraps calls to cip-ml. Every method falls back to a deterministic non-AI result on
 * failure so interview sessions keep working even if the ML service or Gemini key is down.
 */
@Slf4j
@Service
public class MlClient {

    private final RestTemplate restTemplate;
    private final String mlServiceUrl;

    public MlClient(RestTemplate restTemplate, @Value("${ml.service-url}") String mlServiceUrl) {
        this.restTemplate = restTemplate;
        this.mlServiceUrl = mlServiceUrl;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> generateQuestion(String jobRole, String persona, List<Map<String, Object>> previousAnswers) {
        try {
            Map<String, Object> body = Map.of(
                    "resume_data", Map.of("persona_mode", persona != null ? persona.toLowerCase() : "friendly"),
                    "job_role", jobRole != null ? jobRole : "SDE",
                    "previous_answers", previousAnswers != null ? previousAnswers : List.of()
            );
            return restTemplate.postForObject(mlServiceUrl + "/ml/interview/question", body, Map.class);
        } catch (RestClientException e) {
            log.warn("ML question generation failed, using fallback: {}", e.getMessage());
            return Map.of(
                    "question", "Tell me about a challenging technical problem you solved recently.",
                    "difficulty", "MEDIUM",
                    "topic", "General",
                    "expected_answer", "Look for problem framing, approach, trade-offs, and outcome."
            );
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> evaluateAnswer(String question, String answer, String expectedAnswer,
                                               String domain, String difficulty) {
        try {
            Map<String, Object> body = Map.of(
                    "student_id", "0",
                    "question", question != null ? question : "",
                    "answer_text", answer != null ? answer : "",
                    "expected_answer", expectedAnswer != null ? expectedAnswer : "",
                    "domain", domain != null ? domain : "General",
                    "difficulty", difficulty != null ? difficulty : "MEDIUM"
            );
            return restTemplate.postForObject(mlServiceUrl + "/ml/interview/evaluate", body, Map.class);
        } catch (RestClientException e) {
            log.warn("ML answer evaluation failed, using fallback heuristic: {}", e.getMessage());
            double heuristicScore = answer == null || answer.isBlank() ? 0
                    : Math.min(100, 40 + answer.trim().split("\\s+").length * 2.0);
            return Map.of(
                    "overall_score", heuristicScore,
                    "technical_score", heuristicScore,
                    "communication_score", heuristicScore,
                    "confidence_score", heuristicScore,
                    "feedback", answer == null || answer.isBlank() ? "No answer provided." : "Answer recorded.",
                    "improvements", List.of("Could not reach AI evaluator — this is a fallback score."),
                    "model_answer_hint", expectedAnswer != null ? expectedAnswer : ""
            );
        }
    }
}
