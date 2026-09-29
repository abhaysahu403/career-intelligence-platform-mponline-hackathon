package com.cip.interview.service;

import com.cip.common.exception.CipException;
import com.cip.interview.dto.InterviewV3Dtos;
import com.cip.interview.entity.BranchQuestion;
import com.cip.interview.entity.CompanyQuestion;
import com.cip.interview.entity.FacialAnalytics;
import com.cip.interview.entity.Interview;
import com.cip.interview.repository.FacialAnalyticsRepository;
import com.cip.interview.repository.InterviewRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewV3Service {

    private final InterviewRepository interviewRepository;
    private final QuestionBankService questionBankService;
    private final MlClient mlClient;
    private final FacialAnalyticsRepository facialAnalyticsRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public InterviewV3Dtos.SessionResponse start(Long userId, InterviewV3Dtos.StartRequest req) {
        int numQuestions = req.getDuration() != null
                ? Math.max(3, Math.min(10, req.getDuration() / 5))
                : 5;
        String difficulty = req.getDifficulty() != null ? req.getDifficulty() : "MEDIUM";
        String mode = req.getInterviewMode() != null ? req.getInterviewMode() : "ROLE_BASED";

        List<InterviewV3Dtos.QuestionDto> questions = buildQuestions(mode, req, difficulty, numQuestions);

        Interview interview = Interview.builder()
                .userId(userId)
                .type(mapRoundTypeToType(req.getRoundType()))
                .jobRole(req.getRole())
                .interviewMode(mode)
                .company(req.getCompany())
                .branch(req.getBranch())
                .duration(req.getDuration())
                .difficulty(difficulty)
                .persona(req.getPersona() != null ? req.getPersona() : "FRIENDLY_HR")
                .roundType(req.getRoundType() != null ? req.getRoundType() : "TECHNICAL")
                .status(Interview.InterviewStatus.IN_PROGRESS)
                .totalQuestions(questions.size())
                .answeredQuestions(0)
                .build();

        try {
            interview.setQuestions(objectMapper.writeValueAsString(questions));
            interview.setAnswers(objectMapper.writeValueAsString(new ArrayList<>()));
        } catch (Exception e) {
            throw new CipException("Failed to serialize interview questions: " + e.getMessage(), 500);
        }

        interview = interviewRepository.save(interview);
        log.info("V3 interview started: id={}, userId={}, mode={}, questions={}",
                interview.getId(), userId, mode, questions.size());
        return toSessionResponse(interview);
    }

    private List<InterviewV3Dtos.QuestionDto> buildQuestions(String mode, InterviewV3Dtos.StartRequest req,
                                                              String difficulty, int numQuestions) {
        List<InterviewV3Dtos.QuestionDto> questions = new ArrayList<>();

        if ("COMPANY_SPECIFIC".equals(mode) && req.getCompany() != null) {
            List<CompanyQuestion> bank = questionBankService.getCompanyQuestions(req.getCompany(), difficulty);
            if (bank.isEmpty()) {
                bank = questionBankService.getCompanyQuestions(req.getCompany(), null);
            }
            bank.stream().limit(numQuestions).forEach(q -> questions.add(InterviewV3Dtos.QuestionDto.builder()
                    .question(q.getQuestion()).topic(q.getCategory()).difficulty(q.getDifficulty())
                    .ideal(q.getIdealAnswer()).source("company_bank").company(q.getCompanyName()).build()));
        } else if ("BRANCH_BASED".equals(mode) && req.getBranch() != null) {
            List<BranchQuestion> bank = questionBankService.getBranchQuestions(req.getBranch(), difficulty);
            if (bank.isEmpty()) {
                bank = questionBankService.getBranchQuestions(req.getBranch(), null);
            }
            bank.stream().limit(numQuestions).forEach(q -> questions.add(InterviewV3Dtos.QuestionDto.builder()
                    .question(q.getQuestion()).topic(q.getSubject()).difficulty(q.getDifficulty())
                    .ideal(q.getIdealAnswer()).source("branch_bank").branch(q.getBranch()).build()));
        }

        // Top up with AI-generated questions if the bank didn't cover the requested count
        // (also covers RESUME_BASED/ROLE_BASED/TIME_BASED, which have no static bank at all)
        if (questions.size() < numQuestions) {
            List<Map<String, Object>> history = new ArrayList<>();
            while (questions.size() < numQuestions) {
                Map<String, Object> generated = mlClient.generateQuestion(req.getRole(), req.getPersona(), history);
                questions.add(InterviewV3Dtos.QuestionDto.builder()
                        .question(String.valueOf(generated.get("question")))
                        .topic(String.valueOf(generated.getOrDefault("topic", "General")))
                        .difficulty(String.valueOf(generated.getOrDefault("difficulty", difficulty)))
                        .ideal(String.valueOf(generated.getOrDefault("expected_answer", "")))
                        .source("ai_generated")
                        .build());
                history.add(Map.of("question", generated.get("question"), "answer_text", ""));
            }
        }

        return questions;
    }

    private Interview.InterviewType mapRoundTypeToType(String roundType) {
        if (roundType == null) return Interview.InterviewType.TECHNICAL;
        return switch (roundType) {
            case "HR" -> Interview.InterviewType.HR;
            case "BEHAVIORAL" -> Interview.InterviewType.BEHAVIORAL;
            default -> Interview.InterviewType.TECHNICAL;
        };
    }

    public InterviewV3Dtos.SessionResponse getSession(Long userId, Long id) {
        Interview interview = interviewRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> CipException.notFound("Interview"));
        return toSessionResponse(interview);
    }

    public Map<String, Object> getTips(String roundType, String difficulty, Integer duration) {
        List<String> tips = List.of(
                "Think out loud — interviewers score your reasoning, not just the final answer.",
                "Clarify assumptions before diving into a solution.",
                "Structure behavioral answers with the STAR method (Situation, Task, Action, Result).",
                "Keep answers under 2 minutes unless asked to go deeper.",
                "It's fine to say 'let me think for a moment' — silence beats a rushed wrong answer."
        );
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("roundType", roundType != null ? roundType : "TECHNICAL");
        result.put("difficulty", difficulty != null ? difficulty : "MEDIUM");
        result.put("duration", duration != null ? duration : 30);
        result.put("tips", tips);
        return result;
    }

    @Transactional
    public InterviewV3Dtos.QuestionDto getNextQuestion(Long userId, Long id) {
        Interview interview = interviewRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> CipException.notFound("Interview"));
        List<InterviewV3Dtos.QuestionDto> questions = readQuestions(interview);
        int nextIndex = interview.getAnsweredQuestions() != null ? interview.getAnsweredQuestions() : 0;
        if (nextIndex < questions.size()) {
            return questions.get(nextIndex);
        }
        // Ran out of pre-built questions (only possible for AI-driven modes) — generate one more.
        Map<String, Object> generated = mlClient.generateQuestion(interview.getJobRole(), interview.getPersona(), readAnswerHistory(interview));
        InterviewV3Dtos.QuestionDto question = InterviewV3Dtos.QuestionDto.builder()
                .question(String.valueOf(generated.get("question")))
                .topic(String.valueOf(generated.getOrDefault("topic", "General")))
                .difficulty(String.valueOf(generated.getOrDefault("difficulty", interview.getDifficulty())))
                .ideal(String.valueOf(generated.getOrDefault("expected_answer", "")))
                .source("ai_generated")
                .build();
        questions.add(question);
        writeQuestions(interview, questions);
        interview.setTotalQuestions(questions.size());
        interviewRepository.save(interview);
        return question;
    }

    public Map<String, Object> evaluateAnswer(Long userId, Long id, String question, String answer,
                                               String topic, String ideal) {
        Interview interview = interviewRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> CipException.notFound("Interview"));
        Map<String, Object> mlResult = mlClient.evaluateAnswer(question, answer, ideal, topic, interview.getDifficulty());
        return toEvaluationResponse(mlResult, false);
    }

    @Transactional
    public Map<String, Object> submitAndEvaluate(Long userId, Long id, InterviewV3Dtos.SubmitAndEvaluateRequest req) {
        Interview interview = interviewRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> CipException.notFound("Interview"));
        if (interview.getStatus() != Interview.InterviewStatus.IN_PROGRESS) {
            throw CipException.badRequest("Interview is not in progress");
        }

        Map<String, Object> mlResult = mlClient.evaluateAnswer(
                req.getQuestion(), req.getAnswer(), req.getIdeal(), req.getTopic(), interview.getDifficulty());
        double score = toDouble(mlResult.get("overall_score"));

        List<InterviewV3Dtos.AnswerEntryDto> answers = readAnswers(interview);
        answers.add(InterviewV3Dtos.AnswerEntryDto.builder()
                .questionIndex(req.getQuestionIndex())
                .question(req.getQuestion())
                .answer(req.getAnswer())
                .timeTakenSeconds(req.getTimeTaken())
                .score(score)
                .topic(req.getTopic())
                .difficulty(interview.getDifficulty())
                .feedback(Map.of(
                        "good", String.valueOf(mlResult.getOrDefault("feedback", "")),
                        "missing", String.join("; ", asStringList(mlResult.get("improvements"))),
                        "ideal", req.getIdeal() != null ? req.getIdeal() : "",
                        "tip", String.valueOf(mlResult.getOrDefault("model_answer_hint", ""))
                ))
                .build());

        writeAnswers(interview, answers);
        interview.setAnsweredQuestions(answers.size());

        boolean completed = interview.getTotalQuestions() != null && answers.size() >= interview.getTotalQuestions();
        if (completed) {
            interview.setStatus(Interview.InterviewStatus.COMPLETED);
            interview.setCompletedAt(LocalDateTime.now());
            double avg = answers.stream().mapToDouble(a -> a.getScore() != null ? a.getScore() : 0).average().orElse(0);
            interview.setTotalScore(avg);
        }
        interviewRepository.save(interview);

        Map<String, Object> response = toEvaluationResponse(mlResult, completed);
        return response;
    }

    private Map<String, Object> toEvaluationResponse(Map<String, Object> mlResult, boolean completed) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("score", toDouble(mlResult.get("overall_score")));
        response.put("llm_score", toDouble(mlResult.get("technical_score")));
        response.put("semantic_score", toDouble(mlResult.get("communication_score")));
        response.put("good", mlResult.getOrDefault("feedback", ""));
        response.put("missing", String.join("; ", asStringList(mlResult.get("improvements"))));
        response.put("tip", mlResult.getOrDefault("model_answer_hint", ""));
        response.put("completed", completed);
        return response;
    }

    @Transactional
    public InterviewV3Dtos.SessionResponse submitAnswer(Long userId, InterviewV3Dtos.SubmitAnswerRequest req) {
        Interview interview = interviewRepository.findByIdAndUserId(req.getInterviewId(), userId)
                .orElseThrow(() -> CipException.notFound("Interview"));
        List<InterviewV3Dtos.QuestionDto> questions = readQuestions(interview);
        InterviewV3Dtos.QuestionDto question = req.getQuestionIndex() != null && req.getQuestionIndex() < questions.size()
                ? questions.get(req.getQuestionIndex()) : null;

        List<InterviewV3Dtos.AnswerEntryDto> answers = readAnswers(interview);
        answers.add(InterviewV3Dtos.AnswerEntryDto.builder()
                .questionIndex(req.getQuestionIndex())
                .question(question != null ? question.getQuestion() : null)
                .answer(req.getAnswer())
                .timeTakenSeconds(req.getTimeTaken())
                .topic(question != null ? question.getTopic() : null)
                .difficulty(interview.getDifficulty())
                .build());
        writeAnswers(interview, answers);
        interview.setAnsweredQuestions(answers.size());
        interviewRepository.save(interview);
        return toSessionResponse(interview);
    }

    public void saveFacialAnalytics(InterviewV3Dtos.FacialAnalyticsRequest req) {
        facialAnalyticsRepository.save(FacialAnalytics.builder()
                .interviewId(req.getInterviewId())
                .confidenceScore(req.getConfidenceScore())
                .eyeContact(req.getEyeContact())
                .emotion(req.getEmotion())
                .posture(req.getPosture())
                .voiceClarity(req.getVoiceClarity())
                .build());
    }

    public Map<String, Object> getReport(Long userId, Long id) {
        Interview interview = interviewRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> CipException.notFound("Interview"));
        List<InterviewV3Dtos.AnswerEntryDto> answers = readAnswers(interview);
        List<FacialAnalytics> facial = facialAnalyticsRepository.findByInterviewIdOrderByRecordedAtAsc(id);

        double finalScore = interview.getTotalScore() != null ? interview.getTotalScore()
                : answers.stream().mapToDouble(a -> a.getScore() != null ? a.getScore() : 0).average().orElse(0);

        String verdict = finalScore >= 75 ? "STRONG_HIRE" : finalScore >= 50 ? "CONSIDER" : "REJECT";

        double avgConfidence = facial.stream().mapToDouble(f -> f.getConfidenceScore() != null ? f.getConfidenceScore() : 0)
                .average().orElse(70);
        double avgVoiceClarity = facial.stream().mapToDouble(f -> f.getVoiceClarity() != null ? f.getVoiceClarity() : 0)
                .average().orElse(70);
        long goodEyeContact = facial.stream().filter(f -> "GOOD".equals(f.getEyeContact())).count();
        double eyeContactScore = facial.isEmpty() ? 70 : (goodEyeContact * 100.0 / facial.size());

        List<String> weakAreas = answers.stream()
                .filter(a -> a.getScore() != null && a.getScore() < 60 && a.getTopic() != null)
                .map(InterviewV3Dtos.AnswerEntryDto::getTopic).distinct().toList();
        List<String> strongAreas = answers.stream()
                .filter(a -> a.getScore() != null && a.getScore() >= 80 && a.getTopic() != null)
                .map(InterviewV3Dtos.AnswerEntryDto::getTopic).distinct().toList();

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("interview", toSessionResponse(interview));
        report.put("finalScore", finalScore);
        report.put("finalVerdict", verdict);
        report.put("performanceBreakdown", Map.of(
                "communication", avgVoiceClarity,
                "technical", finalScore,
                "confidence", avgConfidence,
                "eyeContact", eyeContactScore,
                "problemSolving", finalScore,
                "clarity", avgVoiceClarity
        ));
        report.put("companyReadiness", interview.getCompany() != null
                ? Map.of(interview.getCompany(), finalScore) : Map.of());
        report.put("weakAreas", weakAreas);
        report.put("strongAreas", strongAreas);
        report.put("recommendations", weakAreas.isEmpty()
                ? List.of("Keep practicing to maintain your current level.")
                : weakAreas.stream().map(t -> "Revisit " + t + " fundamentals and practice more questions.").toList());
        report.put("facialAnalytics", facial.stream().map(f -> Map.of(
                "confidenceScore", f.getConfidenceScore() != null ? f.getConfidenceScore() : 0,
                "eyeContact", f.getEyeContact() != null ? f.getEyeContact() : "GOOD",
                "emotion", f.getEmotion() != null ? f.getEmotion() : "NEUTRAL",
                "posture", f.getPosture() != null ? f.getPosture() : "STABLE",
                "voiceClarity", f.getVoiceClarity() != null ? f.getVoiceClarity() : 0,
                "timestamp", f.getRecordedAt() != null ? f.getRecordedAt().toString() : ""
        )).toList());
        return report;
    }

    // ── JSON (de)serialization helpers ──────────────────────────────────────

    private List<InterviewV3Dtos.QuestionDto> readQuestions(Interview interview) {
        try {
            if (interview.getQuestions() == null || interview.getQuestions().isEmpty()) return new ArrayList<>();
            return objectMapper.readValue(interview.getQuestions(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, InterviewV3Dtos.QuestionDto.class));
        } catch (Exception e) {
            log.error("Failed to parse interview questions", e);
            return new ArrayList<>();
        }
    }

    private void writeQuestions(Interview interview, List<InterviewV3Dtos.QuestionDto> questions) {
        try {
            interview.setQuestions(objectMapper.writeValueAsString(questions));
        } catch (Exception e) {
            throw new CipException("Failed to serialize questions: " + e.getMessage(), 500);
        }
    }

    private List<InterviewV3Dtos.AnswerEntryDto> readAnswers(Interview interview) {
        try {
            if (interview.getAnswers() == null || interview.getAnswers().isEmpty()) return new ArrayList<>();
            return objectMapper.readValue(interview.getAnswers(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, InterviewV3Dtos.AnswerEntryDto.class));
        } catch (Exception e) {
            log.error("Failed to parse interview answers", e);
            return new ArrayList<>();
        }
    }

    private void writeAnswers(Interview interview, List<InterviewV3Dtos.AnswerEntryDto> answers) {
        try {
            interview.setAnswers(objectMapper.writeValueAsString(answers));
        } catch (Exception e) {
            throw new CipException("Failed to serialize answers: " + e.getMessage(), 500);
        }
    }

    private List<Map<String, Object>> readAnswerHistory(Interview interview) {
        return readAnswers(interview).stream()
                .map(a -> Map.<String, Object>of("question", a.getQuestion() != null ? a.getQuestion() : "",
                        "answer_text", a.getAnswer() != null ? a.getAnswer() : ""))
                .toList();
    }

    private InterviewV3Dtos.SessionResponse toSessionResponse(Interview i) {
        return InterviewV3Dtos.SessionResponse.builder()
                .id(i.getId())
                .userId(i.getUserId())
                .interviewMode(i.getInterviewMode())
                .company(i.getCompany())
                .role(i.getJobRole())
                .branch(i.getBranch())
                .duration(i.getDuration())
                .difficulty(i.getDifficulty())
                .persona(i.getPersona())
                .roundType(i.getRoundType())
                .status(i.getStatus() != null ? i.getStatus().name() : null)
                .questions(readQuestions(i))
                .answers(readAnswers(i))
                .totalScore(i.getTotalScore())
                .totalQuestions(i.getTotalQuestions())
                .answeredQuestions(i.getAnsweredQuestions())
                .startedAt(i.getStartedAt())
                .completedAt(i.getCompletedAt())
                .build();
    }

    @SuppressWarnings("unchecked")
    private List<String> asStringList(Object value) {
        if (value instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        return List.of();
    }

    private double toDouble(Object value) {
        if (value instanceof Number number) return number.doubleValue();
        try {
            return value != null ? Double.parseDouble(value.toString()) : 0;
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
