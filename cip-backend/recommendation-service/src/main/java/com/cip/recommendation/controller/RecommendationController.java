package com.cip.recommendation.controller;

import com.cip.common.dto.ApiResponse;
import com.cip.recommendation.dto.CourseDtos;
import com.cip.recommendation.entity.CareerTarget;
import com.cip.recommendation.entity.Course;
import com.cip.recommendation.entity.UserCourseProgress;
import com.cip.recommendation.service.CampusToCorporateService;
import com.cip.recommendation.service.CareerPathClient;
import com.cip.recommendation.service.CourseService;
import com.cip.recommendation.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final CourseService courseService;
    private final CampusToCorporateService campusToCorporateService;
    private final CareerPathClient careerPathClient;

    @SuppressWarnings("unchecked")
    @PostMapping("/recommendations/career-path/discover")
    public ResponseEntity<ApiResponse<Map<String, Object>>> discoverCareerPath(
            @RequestBody Map<String, Object> request) {
        String branch = String.valueOf(request.getOrDefault("branch", ""));
        List<String> interests = (List<String>) request.getOrDefault("interests", List.of());
        List<Map<String, Object>> aptitudeAnswers = (List<Map<String, Object>>) request.getOrDefault("aptitudeAnswers", List.of());
        return ResponseEntity.ok(ApiResponse.success(careerPathClient.discover(branch, interests, aptitudeAnswers)));
    }

    /** GET /recommendations/campus-to-corporate/targets — dropdown data, optionally filtered by type */
    @GetMapping("/recommendations/campus-to-corporate/targets")
    public ResponseEntity<ApiResponse<List<CareerTarget>>> getCareerTargets(
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(ApiResponse.success(campusToCorporateService.getTargets(type)));
    }

    /** GET /recommendations/campus-to-corporate?targetCode=GOOGLE_SWE — the full gap analysis */
    @GetMapping("/recommendations/campus-to-corporate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCampusToCorporate(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam String targetCode) {
        return ResponseEntity.ok(ApiResponse.success(campusToCorporateService.analyze(userId, targetCode)));
    }

    /** POST /recommendations/campus-to-corporate/milestone — toggle a 90-day plan milestone */
    @PostMapping("/recommendations/campus-to-corporate/milestone")
    public ResponseEntity<ApiResponse<String>> toggleMilestone(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Map<String, Object> request) {
        String targetCode = String.valueOf(request.get("targetCode"));
        Integer index = ((Number) request.get("milestoneIndex")).intValue();
        boolean completed = Boolean.TRUE.equals(request.get("completed"));
        campusToCorporateService.toggleMilestone(userId, targetCode, index, completed);
        return ResponseEntity.ok(ApiResponse.success("updated"));
    }

    /** GET /recommendations/courses — AI-style course recommendations from skill gaps */
    @GetMapping("/recommendations/courses")
    public ResponseEntity<ApiResponse<Map<String, Object>>> recommendCourses(
            @RequestParam(required = false) List<String> skillGaps,
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) Double currentReadiness,
            @RequestParam(required = false) String preference) {
        return ResponseEntity.ok(ApiResponse.success(
                courseService.recommend(skillGaps, branch, currentReadiness, preference)));
    }

    /** GET /recommendations/courses/government-certified — NPTEL/SWAYAM highlight section */
    @GetMapping("/recommendations/courses/government-certified")
    public ResponseEntity<ApiResponse<Map<String, Object>>> governmentCertifiedCourses() {
        List<Course> courses = courseService.getGovernmentCertifiedCourses();
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "count", courses.size(),
                "courses", courses
        )));
    }

    /** POST /recommendations/courses/save — add a course to "My Plan" */
    @PostMapping("/recommendations/courses/save")
    public ResponseEntity<ApiResponse<UserCourseProgress>> saveCourse(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody CourseDtos.SaveCourseRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                courseService.saveCourse(userId, request.getCourseId())));
    }

    /** PUT /recommendations/courses/progress — mark a saved course In Progress / Completed */
    @PutMapping("/recommendations/courses/progress")
    public ResponseEntity<ApiResponse<UserCourseProgress>> updateProgress(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody CourseDtos.UpdateProgressRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                courseService.updateProgress(userId, request.getCourseId(), request.getStatus())));
    }

    /** GET /recommendations/courses/pathway — the logged-in user's saved/in-progress/completed courses */
    @GetMapping("/recommendations/courses/pathway")
    public ResponseEntity<ApiResponse<List<UserCourseProgress>>> getPathway(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(ApiResponse.success(courseService.getUserPathway(userId)));
    }

    /** GET /roadmap — personalized learning roadmap */
    @GetMapping("/roadmap")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRoadmap(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) String role,
            @RequestParam(required = false, defaultValue = "Developing") String level,
            @RequestParam(required = false) List<String> skills) {
        return ResponseEntity.ok(ApiResponse.success(
                recommendationService.getRoadmap(role, level, skills != null ? skills : List.of())));
    }

    /** GET /recommendations/skills — what to learn next */
    @GetMapping("/recommendations/skills")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSkillRecommendations(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "50.0") double readiness,
            @RequestParam(required = false) List<String> skills,
            @RequestParam(required = false) String targetRole) {
        return ResponseEntity.ok(ApiResponse.success(
                recommendationService.getSkillRecommendations(userId, readiness,
                        skills != null ? skills : List.of(), targetRole)));
    }

    /** GET /recommendations/resources — curated learning resources */
    @GetMapping("/recommendations/resources")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getResources(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(ApiResponse.success(
                recommendationService.getLearningResources(skill, type)));
    }
}
