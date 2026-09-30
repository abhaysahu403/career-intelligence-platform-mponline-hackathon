package com.cip.recommendation.service;

import com.cip.common.exception.CipException;
import com.cip.recommendation.entity.CareerTarget;
import com.cip.recommendation.entity.Course;
import com.cip.recommendation.entity.UserTargetMilestone;
import com.cip.recommendation.repository.CareerTargetRepository;
import com.cip.recommendation.repository.UserTargetMilestoneRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Powers the "Campus to Corporate" journey screen: combines the student's current
 * profile/score (student-service, score-service) with a target's requirements
 * (career_targets, seeded here) into a gap analysis, metrics, and an action plan
 * built from the same course-recommendation engine Module 3 already has.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CampusToCorporateService {

    private final CareerTargetRepository careerTargetRepository;
    private final UserTargetMilestoneRepository milestoneRepository;
    private final ProfileClient profileClient;
    private final JobMatchClient jobMatchClient;
    private final CourseService courseService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<CareerTarget> getTargets(String type) {
        return type != null
                ? careerTargetRepository.findByActiveTrueAndTargetType(type)
                : careerTargetRepository.findByActiveTrue();
    }

    public Map<String, Object> analyze(Long userId, String targetCode) {
        CareerTarget target = careerTargetRepository.findByTargetCode(targetCode)
                .orElseThrow(() -> CipException.notFound("Career target"));

        Map<String, Object> academic = profileClient.getAcademicProfile(userId);
        Map<String, Object> profile = profileClient.getStudentProfile(userId);
        Map<String, Object> score = profileClient.getScore(userId);

        String branch = str(academic.get("branch"));
        Double cgpa = num(academic.get("currentCgpa"));
        double readiness = num(score.get("readiness")) != null ? num(score.get("readiness")) : 0.0;

        List<String> studentSkills = parseSkills(profile.get("skills"));
        List<Map<String, Object>> skillGaps = buildSkillGapList(target, studentSkills);
        List<String> missingSkills = skillGaps.stream()
                .filter(s -> "RED".equals(s.get("status")))
                .map(s -> (String) s.get("skill"))
                .toList();

        boolean cgpaMet = target.getMinCgpa() == null || (cgpa != null && cgpa >= target.getMinCgpa());

        double skillMatchRatio = target.getRequiredSkills().length == 0 ? 1.0
                : (double) (target.getRequiredSkills().length - missingSkills.size()) / target.getRequiredSkills().length;
        double readinessRatio = Math.min(1.0, readiness / Math.max(1, target.getReadinessRequired()));
        double completionRatio = skillMatchRatio * 0.7 + readinessRatio * 0.3;
        long estimatedDays = Math.round(target.getPreparationWeeks() * 7 * (1 - completionRatio));

        List<Map<String, Object>> actionPlan = buildActionPlan(userId, target, missingSkills, branch, readiness);

        long matchingJobsCount = "GOVERNMENT".equals(target.getTargetType())
                ? jobMatchClient.getGovernmentEligibleCount(branch, cgpa)
                : "PRIVATE_TECH".equals(target.getTargetType()) ? jobMatchClient.getPrivateJobsCount() : 0;

        Map<String, Object> currentProfile = new LinkedHashMap<>();
        currentProfile.put("branch", branch);
        currentProfile.put("cgpa", cgpa);
        currentProfile.put("yearOfStudy", academic.get("yearOfStudy"));
        currentProfile.put("activeBacklogs", academic.get("activeBacklogs"));
        currentProfile.put("skills", studentSkills);
        currentProfile.put("readiness", readiness);
        currentProfile.put("technicalScore", score.get("resumeScore"));
        currentProfile.put("communicationScore", score.get("interviewScore"));
        currentProfile.put("domainScore", score.get("academicScore"));

        Map<String, Object> targetRequirements = new LinkedHashMap<>();
        targetRequirements.put("targetCode", target.getTargetCode());
        targetRequirements.put("name", target.getName());
        targetRequirements.put("type", target.getTargetType());
        targetRequirements.put("minCgpa", target.getMinCgpa());
        targetRequirements.put("cgpaMet", cgpaMet);
        targetRequirements.put("requiredSkills", target.getRequiredSkills());
        targetRequirements.put("preferredSkills", target.getPreferredSkills());
        targetRequirements.put("interviewRounds", target.getInterviewRounds());
        targetRequirements.put("avgPackageLpa", target.getAvgPackageLpa());
        targetRequirements.put("hiringMonths", target.getHiringMonths());
        targetRequirements.put("readinessRequired", target.getReadinessRequired());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("currentProfile", currentProfile);
        result.put("targetRequirements", targetRequirements);
        result.put("gapAnalysis", skillGaps);
        result.put("gapPoints", Math.max(0, target.getReadinessRequired() - readiness));
        result.put("actionPlan", actionPlan);
        result.put("readinessPercentage", Math.round(completionRatio * 100));
        result.put("estimatedDaysToReady", Math.max(0, estimatedDays));
        result.put("matchingJobsCount", matchingJobsCount);
        return result;
    }

    @Transactional
    public void toggleMilestone(Long userId, String targetCode, Integer milestoneIndex, boolean completed) {
        UserTargetMilestone milestone = milestoneRepository
                .findByUserIdAndTargetCodeAndMilestoneIndex(userId, targetCode, milestoneIndex)
                .orElse(UserTargetMilestone.builder()
                        .userId(userId).targetCode(targetCode).milestoneIndex(milestoneIndex).build());
        milestone.setCompleted(completed);
        milestone.setCompletedAt(completed ? LocalDateTime.now() : null);
        milestoneRepository.save(milestone);
    }

    private List<Map<String, Object>> buildSkillGapList(CareerTarget target, List<String> studentSkills) {
        Set<String> owned = new HashSet<>();
        for (String s : studentSkills) owned.add(s.toLowerCase());

        List<Map<String, Object>> result = new ArrayList<>();
        for (String skill : target.getRequiredSkills()) {
            boolean has = owned.contains(skill.toLowerCase());
            result.add(Map.of("skill", skill, "status", has ? "GREEN" : "RED", "required", true));
        }
        if (target.getPreferredSkills() != null) {
            for (String skill : target.getPreferredSkills()) {
                boolean has = owned.contains(skill.toLowerCase());
                result.add(Map.of("skill", skill, "status", has ? "GREEN" : "YELLOW", "required", false));
            }
        }
        return result;
    }

    private List<Map<String, Object>> buildActionPlan(Long userId, CareerTarget target, List<String> missingSkills,
                                                        String branch, double readiness) {
        Map<String, Object> recommendations = missingSkills.isEmpty()
                ? Map.of("startThisWeek", List.of(), "nextMonth", List.of(), "longTerm", List.of())
                : courseService.recommend(missingSkills, branch, readiness, "fastest");

        List<Map<String, Object>> milestones = new ArrayList<>();
        addMilestones(milestones, "WEEK 1-2", recommendations.get("startThisWeek"), 2);
        addMilestones(milestones, "WEEK 3-6", recommendations.get("nextMonth"), 2);
        addMilestones(milestones, "WEEK 7-10", recommendations.get("longTerm"), 1);
        milestones.add(Map.of(
                "phase", "WEEK 11-12",
                "title", "Apply to " + target.getName(),
                "description", "Submit applications and prepare for the interview rounds.",
                "index", milestones.size()
        ));

        List<UserTargetMilestone> saved = milestoneRepository.findByUserIdAndTargetCode(userId, target.getTargetCode());
        Map<Integer, Boolean> completedByIndex = new HashMap<>();
        for (UserTargetMilestone m : saved) completedByIndex.put(m.getMilestoneIndex(), m.isCompleted());

        List<Map<String, Object>> finalPlan = new ArrayList<>();
        for (int i = 0; i < milestones.size(); i++) {
            Map<String, Object> m = new LinkedHashMap<>(milestones.get(i));
            m.put("index", i);
            m.put("completed", completedByIndex.getOrDefault(i, false));
            finalPlan.add(m);
        }
        return finalPlan;
    }

    @SuppressWarnings("unchecked")
    private void addMilestones(List<Map<String, Object>> milestones, String phase, Object entries, int limit) {
        if (!(entries instanceof List<?> list)) return;
        int count = 0;
        for (Object entry : list) {
            if (count >= limit) break;
            if (entry instanceof Map<?, ?> map && map.get("course") instanceof Course course) {
                milestones.add(Map.of(
                        "phase", phase,
                        "title", "Complete " + course.getTitle(),
                        "description", course.getPlatform() + " — " + course.getDurationWeeks() + " weeks",
                        "courseUrl", course.getUrl(),
                        "index", milestones.size()
                ));
                count++;
            }
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> parseSkills(Object skillsField) {
        if (skillsField == null) return List.of();
        try {
            if (skillsField instanceof String s) {
                Object parsed = objectMapper.readValue(s, Object.class);
                return normalizeSkillList(parsed);
            }
            return normalizeSkillList(skillsField);
        } catch (Exception e) {
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> normalizeSkillList(Object parsed) {
        if (!(parsed instanceof List<?> list)) return List.of();
        List<String> result = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof String s) result.add(s);
            else if (item instanceof Map<?, ?> map && map.get("name") != null) result.add(String.valueOf(map.get("name")));
        }
        return result;
    }

    private String str(Object o) {
        return o != null ? String.valueOf(o) : null;
    }

    private Double num(Object o) {
        if (o instanceof Number n) return n.doubleValue();
        return null;
    }
}
