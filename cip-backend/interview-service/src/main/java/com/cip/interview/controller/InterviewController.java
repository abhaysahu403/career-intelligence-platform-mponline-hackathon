package com.cip.interview.controller;

import com.cip.common.dto.ApiResponse;
import com.cip.interview.dto.InterviewDtos;
import com.cip.interview.dto.InterviewV3Dtos;
import com.cip.interview.entity.BranchQuestion;
import com.cip.interview.entity.CompanyQuestion;
import com.cip.interview.service.InterviewService;
import com.cip.interview.service.InterviewV3Service;
import com.cip.interview.service.QuestionBankService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;
    private final InterviewV3Service interviewV3Service;
    private final QuestionBankService questionBankService;

    @GetMapping("/questions/companies")
    public ResponseEntity<ApiResponse<List<String>>> listCompanies() {
        return ResponseEntity.ok(ApiResponse.success(questionBankService.getCompanies()));
    }

    @GetMapping("/questions/company/{companyName}")
    public ResponseEntity<ApiResponse<List<CompanyQuestion>>> companyQuestions(
            @PathVariable String companyName,
            @RequestParam(required = false) String difficulty) {
        return ResponseEntity.ok(ApiResponse.success(
                questionBankService.getCompanyQuestions(companyName, difficulty)));
    }

    @GetMapping("/questions/branches")
    public ResponseEntity<ApiResponse<List<String>>> listBranches() {
        return ResponseEntity.ok(ApiResponse.success(questionBankService.getBranches()));
    }

    @GetMapping("/questions/branch/{branch}")
    public ResponseEntity<ApiResponse<List<BranchQuestion>>> branchQuestions(
            @PathVariable String branch,
            @RequestParam(required = false) String difficulty) {
        return ResponseEntity.ok(ApiResponse.success(
                questionBankService.getBranchQuestions(branch, difficulty)));
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<InterviewDtos.InterviewResponse>> start(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody InterviewDtos.StartRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Interview started",
                interviewService.startInterview(userId, request)));
    }

    @PostMapping("/v3/start")
    public ResponseEntity<ApiResponse<InterviewV3Dtos.SessionResponse>> startV3(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody InterviewV3Dtos.StartRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Interview started",
                interviewV3Service.start(userId, request)));
    }

    @GetMapping("/v3/tips")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTipsV3(
            @RequestParam(required = false) String roundType,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) Integer duration) {
        return ResponseEntity.ok(ApiResponse.success(
                interviewV3Service.getTips(roundType, difficulty, duration)));
    }

    @GetMapping("/v3/session/{id}")
    public ResponseEntity<ApiResponse<InterviewV3Dtos.SessionResponse>> getSessionV3(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(interviewV3Service.getSession(userId, id)));
    }

    @GetMapping("/v3/{id}/next-question")
    public ResponseEntity<ApiResponse<InterviewV3Dtos.QuestionDto>> getNextQuestionV3(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(interviewV3Service.getNextQuestion(userId, id)));
    }

    @PostMapping("/v3/{id}/evaluate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> evaluateV3(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @RequestBody InterviewV3Dtos.SubmitAndEvaluateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(interviewV3Service.evaluateAnswer(
                userId, id, request.getQuestion(), request.getAnswer(), request.getTopic(), request.getIdeal())));
    }

    @PostMapping("/v3/{id}/submit-and-evaluate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitAndEvaluateV3(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @RequestBody InterviewV3Dtos.SubmitAndEvaluateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(interviewV3Service.submitAndEvaluate(userId, id, request)));
    }

    @PostMapping("/v3/answer")
    public ResponseEntity<ApiResponse<InterviewV3Dtos.SessionResponse>> submitAnswerV3(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody InterviewV3Dtos.SubmitAnswerRequest request) {
        return ResponseEntity.ok(ApiResponse.success(interviewV3Service.submitAnswer(userId, request)));
    }

    @PostMapping("/v3/analytics/facial")
    public ResponseEntity<ApiResponse<String>> saveFacialAnalyticsV3(
            @RequestBody InterviewV3Dtos.FacialAnalyticsRequest request) {
        interviewV3Service.saveFacialAnalytics(request);
        return ResponseEntity.ok(ApiResponse.success("saved"));
    }

    @GetMapping("/v3/report/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReportV3(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(interviewV3Service.getReport(userId, id)));
    }

    @GetMapping("/v3/config")
    public ResponseEntity<Object> getConfigV3() {
        return ResponseEntity.ok(java.util.Map.of(
            "success", true,
            "data", java.util.Map.of(
                "companies", java.util.List.of("Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", "Tesla", "Uber", "Airbnb", "Stripe"),
                "roles", java.util.List.of("Software Engineer", "Backend Developer", "Frontend Developer", "Full Stack Developer", "DevOps Engineer", "Data Engineer", "ML Engineer", "Cloud Architect"),
                "branches", java.util.List.of("Computer Science", "Information Technology", "Electronics", "Electrical", "Mechanical", "Civil"),
                "difficulties", java.util.List.of("EASY", "MEDIUM", "HARD", "FAANG"),
                "personas", java.util.List.of("FRIENDLY_HR", "STRICT_TECHNICAL", "STARTUP_FOUNDER", "FAANG_INTERVIEWER", "SENIOR_ARCHITECT"),
                "durations", java.util.List.of(15, 30, 45, 60, 90)
            )
        ));
    }

    @PostMapping("/answer")
    public ResponseEntity<ApiResponse<InterviewDtos.InterviewResponse>> answer(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody InterviewDtos.AnswerRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Answer recorded",
                interviewService.submitAnswer(userId, request)));
    }

    @PostMapping("/end")
    public ResponseEntity<ApiResponse<InterviewDtos.InterviewResponse>> end(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Long interviewId) {
        return ResponseEntity.ok(ApiResponse.success("Interview completed",
                interviewService.endInterview(userId, interviewId)));
    }

    @GetMapping("/result/{id}")
    public ResponseEntity<ApiResponse<InterviewDtos.InterviewResponse>> getResult(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(interviewService.getResult(userId, id)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<InterviewDtos.InterviewResponse>>> history(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(ApiResponse.success(interviewService.getHistory(userId)));
    }
}
