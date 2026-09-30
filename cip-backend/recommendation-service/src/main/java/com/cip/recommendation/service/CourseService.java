package com.cip.recommendation.service;

import com.cip.common.exception.CipException;
import com.cip.recommendation.entity.Course;
import com.cip.recommendation.entity.UserCourseProgress;
import com.cip.recommendation.repository.CourseRepository;
import com.cip.recommendation.repository.UserCourseProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserCourseProgressRepository progressRepository;

    /**
     * Deterministic weighted match (same pattern as government job matching — no AI needed):
     * skill-gap coverage 40%, government-platform bonus 20%, rating up to 20%, branch relevance 10%.
     * Grouped into Start This Week (top 2) / Next Month (next 3) / Long Term (next 3), capped at 8.
     */
    public Map<String, Object> recommend(List<String> skillGaps, String branch, Double currentReadiness,
                                          String preference) {
        List<String> gaps = skillGaps != null ? skillGaps : List.of();

        List<Course> candidates = courseRepository.findByActiveTrue();
        if ("government_platform_first".equals(preference)) {
            candidates = candidates.stream()
                    .sorted(Comparator.comparing(Course::isGovernmentRecognized).reversed())
                    .toList();
        } else if ("free_only".equals(preference)) {
            candidates = candidates.stream()
                    .filter(c -> c.getCost() != null && c.getCost().toLowerCase().contains("free"))
                    .toList();
        }

        List<Map<String, Object>> scored = candidates.stream()
                .map(c -> {
                    int matchedSkills = countMatchedSkills(c, gaps);
                    double score = scoreCourse(c, matchedSkills, branch, preference);
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("course", c);
                    entry.put("matchedSkillsCount", matchedSkills);
                    entry.put("matchScore", Math.round(score));
                    return entry;
                })
                .filter(e -> (Integer) e.get("matchedSkillsCount") > 0 || gaps.isEmpty())
                .sorted((a, b) -> Long.compare((Long) b.get("matchScore"), (Long) a.get("matchScore")))
                .limit(8)
                .toList();

        List<Map<String, Object>> startThisWeek = scored.stream().limit(2).toList();
        List<Map<String, Object>> nextMonth = scored.stream().skip(2).limit(3).toList();
        List<Map<String, Object>> longTerm = scored.stream().skip(5).limit(3).toList();

        int totalMatchedSkills = scored.stream().mapToInt(e -> (Integer) e.get("matchedSkillsCount")).sum();
        double readinessGain = Math.min(25, totalMatchedSkills * 3);
        double baseReadiness = currentReadiness != null ? currentReadiness : 50.0;
        double projectedReadiness = Math.min(100, baseReadiness + readinessGain);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("startThisWeek", startThisWeek);
        result.put("nextMonth", nextMonth);
        result.put("longTerm", longTerm);
        result.put("learningPathWeeks", scored.stream()
                .mapToInt(e -> {
                    Course c = (Course) e.get("course");
                    return c.getDurationWeeks() != null ? c.getDurationWeeks() : 4;
                }).sum());
        result.put("currentReadiness", baseReadiness);
        result.put("estimatedReadinessAfter", projectedReadiness);
        return result;
    }

    public List<Course> getGovernmentCertifiedCourses() {
        return courseRepository.findByActiveTrueAndGovernmentRecognizedTrue();
    }

    public long getGovernmentCourseCount() {
        return courseRepository.findByActiveTrueAndGovernmentRecognizedTrue().size();
    }

    public UserCourseProgress saveCourse(Long userId, Long courseId) {
        return progressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseGet(() -> progressRepository.save(UserCourseProgress.builder()
                        .userId(userId).courseId(courseId).status("SAVED")
                        .savedAt(LocalDateTime.now()).build()));
    }

    public UserCourseProgress updateProgress(Long userId, Long courseId, String status) {
        UserCourseProgress progress = progressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> CipException.notFound("Saved course"));
        progress.setStatus(status);
        progress.setUpdatedAt(LocalDateTime.now());
        return progressRepository.save(progress);
    }

    public List<UserCourseProgress> getUserPathway(Long userId) {
        return progressRepository.findByUserId(userId);
    }

    private int countMatchedSkills(Course course, List<String> gaps) {
        if (course.getSkillsCovered() == null || gaps.isEmpty()) return 0;
        Set<String> covered = new HashSet<>();
        for (String s : course.getSkillsCovered()) covered.add(s.toLowerCase());
        int count = 0;
        for (String gap : gaps) {
            if (covered.contains(gap.toLowerCase())) count++;
        }
        return count;
    }

    private double scoreCourse(Course course, int matchedSkills, String branch, String preference) {
        double score = matchedSkills * 40.0;
        if (course.isGovernmentRecognized()) {
            score += "government_platform_first".equals(preference) ? 35 : 20;
        }
        if (course.getRating() != null) {
            score += course.getRating() * 4; // up to +20 for a 5.0 rating
        }
        if (branch != null && course.getBranches() != null) {
            boolean branchMatch = Arrays.stream(course.getBranches())
                    .anyMatch(b -> "ALL".equalsIgnoreCase(b) || b.equalsIgnoreCase(branch));
            if (branchMatch) score += 10;
        }
        if ("fastest".equals(preference) && course.getDurationWeeks() != null) {
            score += Math.max(0, 10 - course.getDurationWeeks());
        }
        return score;
    }
}
