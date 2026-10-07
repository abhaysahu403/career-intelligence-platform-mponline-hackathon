package com.cip.analytics.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final RestTemplate restTemplate;

    @Value("${service.score-service:http://score-service:8084}")
    private String scoreServiceUrl;

    @Value("${service.interview-service:http://interview-service:8086}")
    private String interviewServiceUrl;

    @Value("${service.student-service:http://student-service:8082}")
    private String studentServiceUrl;

    @Value("${service.auth-service:http://auth-service:8081}")
    private String authServiceUrl;

    @Value("${service.job-service:http://job-service:8086}")
    private String jobServiceUrl;

    public Map<String, Object> getStudentAnalytics(Long userId) {
        Map<String, Object> score = fetchScore(userId);
        List<Map<String, Object>> history = fetchInterviewHistory(userId);

        double readiness = toDouble(score.get("readiness"));
        double averageInterviewScore = history.stream()
                .mapToDouble(item -> toDouble(item.get("totalScore")))
                .filter(value -> value > 0)
                .average()
                .orElse(0);

        List<Map<String, Object>> progressHistory = history.stream()
                .map(item -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("date", String.valueOf(item.getOrDefault("completedAt", item.getOrDefault("startedAt", ""))));
                    m.put("score", toDouble(item.get("totalScore")));
                    return m;
                })
                .toList();

        return new LinkedHashMap<>(Map.ofEntries(
                Map.entry("userId", userId),
                Map.entry("readiness", readiness),
                Map.entry("risk", resolveRisk(readiness)),
                Map.entry("resumeScore", toDouble(score.get("resumeScore"))),
                Map.entry("interviewScore", toDouble(score.get("interviewScore"))),
                Map.entry("averageInterviewScore", averageInterviewScore),
                Map.entry("totalAttempts", history.size()),
                Map.entry("weakSkills", extractWeakSkills(history)),
                Map.entry("progressHistory", progressHistory),
                Map.entry("interviewHistory", progressHistory),
                Map.entry("latestRecommendation", String.valueOf(score.getOrDefault("recommendation", "")))
        ));
    }

    public Map<String, Object> getPlatformAnalytics() {
        List<Map<String, Object>> leaderboard = fetchLeaderboard();
        double averageReadiness = leaderboard.stream()
                .mapToDouble(item -> toDouble(item.get("readiness")))
                .average()
                .orElse(0);

        return Map.of(
                "totalStudents", leaderboard.size(),
                "averageReadiness", averageReadiness,
                "topReadiness", leaderboard.stream().mapToDouble(item -> toDouble(item.get("readiness"))).max().orElse(0)
        );
    }

    /**
     * Cohort-wide view for faculty/TPO: joins academic profiles (branch), the score
     * leaderboard (readiness), and user names — all three services have no shared
     * join, so this is assembled in-memory from three parallel-in-spirit REST calls.
     */
    public Map<String, Object> getInstitutionOverview() {
        List<Map<String, Object>> profiles = fetchAllAcademicProfiles();
        List<Map<String, Object>> students = fetchAllStudentUsers();
        List<Map<String, Object>> leaderboard = fetchLeaderboard();

        Map<Long, Map<String, Object>> profileByUserId = new LinkedHashMap<>();
        for (Map<String, Object> p : profiles) {
            Long userId = toLong(p.get("userId"));
            if (userId != null) profileByUserId.put(userId, p);
        }
        Map<Long, Map<String, Object>> userById = new LinkedHashMap<>();
        for (Map<String, Object> u : students) {
            Long id = toLong(u.get("id"));
            if (id != null) userById.put(id, u);
        }

        record Row(Long userId, String name, String branch, Integer year, Double cgpa,
                   double readiness, double interviewScore, String risk, String lastActive) {}

        List<Row> rows = new ArrayList<>();
        for (Map<String, Object> score : leaderboard) {
            Long userId = toLong(score.get("userId"));
            if (userId == null) continue;
            Map<String, Object> profile = profileByUserId.getOrDefault(userId, Map.of());
            Map<String, Object> user = userById.getOrDefault(userId, Map.of());
            double readiness = toDouble(score.get("readiness"));
            rows.add(new Row(
                    userId,
                    String.valueOf(user.getOrDefault("name", "Student " + userId)),
                    String.valueOf(profile.getOrDefault("branch", "UNKNOWN")),
                    profile.get("yearOfStudy") instanceof Number n ? n.intValue() : null,
                    profile.get("currentCgpa") instanceof Number n ? n.doubleValue() : null,
                    readiness,
                    toDouble(score.get("interviewScore")),
                    resolveRisk(readiness),
                    String.valueOf(score.getOrDefault("calculatedAt", ""))
            ));
        }

        Map<String, List<Row>> byBranch = new LinkedHashMap<>();
        for (Row r : rows) {
            byBranch.computeIfAbsent(r.branch(), k -> new ArrayList<>()).add(r);
        }

        List<Map<String, Object>> branchStats = byBranch.entrySet().stream()
                .map(e -> {
                    List<Row> branchRows = e.getValue();
                    double avgReadiness = branchRows.stream().mapToDouble(Row::readiness).average().orElse(0);
                    long jobReady = branchRows.stream().filter(r -> r.readiness() >= 70).count();
                    long atRisk = branchRows.stream().filter(r -> r.readiness() < 50).count();
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("branch", e.getKey());
                    m.put("studentCount", branchRows.size());
                    m.put("avgReadiness", Math.round(avgReadiness * 10) / 10.0);
                    m.put("jobReadyCount", jobReady);
                    m.put("atRiskCount", atRisk);
                    return m;
                })
                .sorted((a, b) -> Integer.compare((int) b.get("studentCount"), (int) a.get("studentCount")))
                .toList();

        List<Map<String, Object>> atRiskStudents = rows.stream()
                .filter(r -> "HIGH".equals(r.risk()))
                .sorted((a, b) -> Double.compare(a.readiness(), b.readiness()))
                .limit(20)
                .map(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", r.userId());
                    m.put("name", r.name());
                    m.put("branch", r.branch());
                    m.put("year", r.year());
                    m.put("cgpa", r.cgpa());
                    m.put("readiness", r.readiness());
                    m.put("risk", r.risk());
                    m.put("lastActive", r.lastActive());
                    m.put("interviewScore", r.interviewScore());
                    return m;
                })
                .toList();

        double avgReadiness = rows.stream().mapToDouble(Row::readiness).average().orElse(0);
        long jobReadyCount = rows.stream().filter(r -> r.readiness() >= 70).count();
        long atRiskCount = rows.stream().filter(r -> r.readiness() < 50).count();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalStudents", rows.size());
        result.put("avgReadiness", Math.round(avgReadiness * 10) / 10.0);
        result.put("jobReadyCount", jobReadyCount);
        result.put("atRiskCount", atRiskCount);
        result.put("branchStats", branchStats);
        result.put("atRiskStudents", atRiskStudents);
        return result;
    }

    /**
     * Industry Requirement Dashboard: ranks real job-posting skill demand against
     * how much of the cohort already has each skill, so faculty can see concrete
     * curriculum gaps instead of guessing. Required skills count double a
     * nice-to-have skill toward demand, since they're the harder requirement.
     */
    public Map<String, Object> getSkillGapOverview() {
        List<Map<String, Object>> jobs = fetchAllActiveJobs();
        List<Map<String, Object>> studentSkillRows = fetchAllStudentSkills();

        int totalStudents = studentSkillRows.size();
        Map<String, Integer> studentCoverage = new LinkedHashMap<>();
        for (Map<String, Object> row : studentSkillRows) {
            for (String skill : canonicalSkillSet(row.get("skills"))) {
                studentCoverage.merge(skill, 1, Integer::sum);
            }
        }

        Map<String, Double> demandScore = new LinkedHashMap<>();
        for (Map<String, Object> job : jobs) {
            for (String skill : canonicalSkillSet(job.get("requiredSkills"))) {
                demandScore.merge(skill, 1.0, Double::sum);
            }
            for (String skill : canonicalSkillSet(job.get("niceToHaveSkills"))) {
                demandScore.merge(skill, 0.5, Double::sum);
            }
        }

        int totalJobs = jobs.size();
        List<Map<String, Object>> topDemandedSkills = demandScore.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(15)
                .map(entry -> buildSkillDemand(entry.getKey(), entry.getValue(), totalJobs, studentCoverage, totalStudents))
                .toList();

        List<Map<String, Object>> criticalGaps = topDemandedSkills.stream()
                .filter(m -> "HIGH".equals(m.get("status")))
                .sorted((a, b) -> Double.compare((double) b.get("demandCount"), (double) a.get("demandCount")))
                .limit(10)
                .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalActiveJobs", totalJobs);
        result.put("totalStudents", totalStudents);
        result.put("topDemandedSkills", topDemandedSkills);
        result.put("criticalGaps", criticalGaps);
        return result;
    }

    private Map<String, Object> buildSkillDemand(String skill, double demandScore, int totalJobs,
                                                  Map<String, Integer> studentCoverage, int totalStudents) {
        int studentsWithSkill = studentCoverage.getOrDefault(skill, 0);
        double demandPct = totalJobs == 0 ? 0 : (demandScore / totalJobs) * 100;
        double coveragePct = totalStudents == 0 ? 0 : (studentsWithSkill * 100.0) / totalStudents;
        // Reuses the readiness-style tri-band convention (LOW/MEDIUM/HIGH) from
        // resolveRisk, but here HIGH means "high gap" (low coverage), not high readiness.
        String status = coveragePct >= 66 ? "LOW" : coveragePct >= 33 ? "MEDIUM" : "HIGH";

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("skill", skill);
        m.put("demandCount", Math.round(demandScore * 10) / 10.0);
        m.put("demandPct", Math.round(demandPct * 10) / 10.0);
        m.put("studentsWithSkill", studentsWithSkill);
        m.put("coveragePct", Math.round(coveragePct * 10) / 10.0);
        m.put("status", status);
        return m;
    }

    @SuppressWarnings("unchecked")
    private List<String> canonicalSkillSet(Object skillsField) {
        if (!(skillsField instanceof List<?> list)) return List.of();
        Set<String> result = new LinkedHashSet<>();
        for (Object item : list) {
            if (item instanceof String s && !s.isBlank()) {
                result.add(s.trim());
            }
        }
        return new ArrayList<>(result);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchAllActiveJobs() {
        try {
            HttpHeaders headers = new HttpHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    jobServiceUrl + "/jobs?size=500",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );
            Object data = response.getBody() != null ? response.getBody().get("data") : null;
            if (data instanceof Map<?, ?> page) {
                Object content = page.get("content");
                if (content instanceof List<?> list) {
                    List<Map<String, Object>> items = new ArrayList<>();
                    for (Object entry : list) {
                        if (entry instanceof Map<?, ?> map) {
                            items.add((Map<String, Object>) map);
                        }
                    }
                    return items;
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch active jobs for skill-gap overview: {}", e.getMessage());
        }
        return List.of();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchAllStudentSkills() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Role", "FACULTY");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    studentServiceUrl + "/student/profiles/skills/all",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );
            return extractList(response.getBody());
        } catch (Exception e) {
            log.warn("Failed to fetch student skills for skill-gap overview: {}", e.getMessage());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchAllAcademicProfiles() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Role", "FACULTY");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    studentServiceUrl + "/student/academic/all",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );
            return extractList(response.getBody());
        } catch (Exception e) {
            log.warn("Failed to fetch academic profiles for institution overview: {}", e.getMessage());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchAllStudentUsers() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Role", "FACULTY");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    authServiceUrl + "/auth/users?role=STUDENT",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );
            return extractList(response.getBody());
        } catch (Exception e) {
            log.warn("Failed to fetch student users for institution overview: {}", e.getMessage());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractList(Map<?, ?> wrapper) {
        Object payload = wrapper != null ? wrapper.get("data") : null;
        if (payload instanceof List<?> list) {
            List<Map<String, Object>> items = new ArrayList<>();
            for (Object entry : list) {
                if (entry instanceof Map<?, ?> map) {
                    items.add((Map<String, Object>) map);
                }
            }
            return items;
        }
        return List.of();
    }

    private Long toLong(Object value) {
        return value instanceof Number number ? number.longValue() : null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchScore(Long userId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", String.valueOf(userId));
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    scoreServiceUrl + "/score",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );
            return unwrapMap(response.getBody());
        } catch (Exception e) {
            log.warn("Failed to fetch score for userId={}: {}", userId, e.getMessage());
            return Map.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchInterviewHistory(Long userId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", String.valueOf(userId));
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    interviewServiceUrl + "/interview/history",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );
            Object payload = response.getBody() != null ? response.getBody().get("data") : null;
            if (payload instanceof List<?> list) {
                List<Map<String, Object>> items = new ArrayList<>();
                for (Object entry : list) {
                    if (entry instanceof Map<?, ?> map) {
                        items.add((Map<String, Object>) map);
                    }
                }
                return items.stream()
                        .filter(item -> "COMPLETED".equals(String.valueOf(item.get("status"))))
                        .toList();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch interview history for userId={}: {}", userId, e.getMessage());
        }
        return List.of();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchLeaderboard() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Role", "ADMIN");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    scoreServiceUrl + "/score/leaderboard",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );
            Object payload = response.getBody() != null ? response.getBody().get("data") : null;
            if (payload instanceof List<?> list) {
                List<Map<String, Object>> items = new ArrayList<>();
                for (Object entry : list) {
                    if (entry instanceof Map<?, ?> map) {
                        items.add((Map<String, Object>) map);
                    }
                }
                return items;
            }
        } catch (Exception e) {
            log.warn("Failed to fetch leaderboard analytics: {}", e.getMessage());
        }
        return List.of();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> unwrapMap(Map<?, ?> wrapper) {
        if (wrapper == null) {
            return Map.of();
        }
        Object data = wrapper.get("data");
        if (data instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return Map.of();
    }

    @SuppressWarnings("unchecked")
    private List<String> extractWeakSkills(List<Map<String, Object>> history) {
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (Map<String, Object> interview : history) {
            Object answersObj = interview.get("answers");
            if (!(answersObj instanceof List<?> answers)) {
                continue;
            }
            for (Object entry : answers) {
                if (!(entry instanceof Map<?, ?> rawMap)) {
                    continue;
                }
                @SuppressWarnings("unchecked")
                Map<String, Object> map = (Map<String, Object>) rawMap;
                double score = toDouble(map.get("score"));
                String topic = String.valueOf(map.getOrDefault("topic", "")).trim();
                if (!topic.isBlank() && score > 0 && score < 70) {
                    counts.put(topic, counts.getOrDefault(topic, 0) + 1);
                }
            }
        }
        return counts.entrySet().stream()
                .filter(entry -> entry.getValue() >= 1)
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .map(Map.Entry::getKey)
                .limit(5)
                .toList();
    }

    private String resolveRisk(double readiness) {
        if (readiness >= 70) return "LOW";
        if (readiness >= 50) return "MEDIUM";
        return "HIGH";
    }

    private double toDouble(Object value) {
        return value instanceof Number number ? number.doubleValue() : 0;
    }

    @SuppressWarnings("unchecked")
    public String generateRoadmapHtml(Map<String, Object> payload) {
        Object tasksRaw = payload.get("tasks");
        List<Map<String, Object>> tasks = tasksRaw instanceof List<?> list
                ? (List<Map<String, Object>>) (List<?>) list
                : List.of();

        Map<Integer, List<Map<String, Object>>> byWeek = new java.util.TreeMap<>();
        int completedCount = 0;
        for (Map<String, Object> task : tasks) {
            int week = (int) toDouble(task.get("week"));
            byWeek.computeIfAbsent(week, k -> new ArrayList<>()).add(task);
            if (Boolean.TRUE.equals(task.get("completed"))) completedCount++;
        }
        int total = tasks.size();
        int pct = total > 0 ? Math.round(completedCount * 100f / total) : 0;

        StringBuilder weeks = new StringBuilder();
        for (Map.Entry<Integer, List<Map<String, Object>>> entry : byWeek.entrySet()) {
            weeks.append("<h2>Week ").append(entry.getKey()).append("</h2><ul>");
            for (Map<String, Object> task : entry.getValue()) {
                boolean done = Boolean.TRUE.equals(task.get("completed"));
                String title = htmlEscape(String.valueOf(task.getOrDefault("task", "")));
                String description = htmlEscape(String.valueOf(task.getOrDefault("description", "")));
                weeks.append("<li class=\"").append(done ? "done" : "pending").append("\">")
                        .append("<strong>").append(done ? "✓ " : "○ ").append(title).append("</strong>");
                if (!description.isBlank() && !"null".equals(description)) {
                    weeks.append("<div class=\"desc\">").append(description).append("</div>");
                }
                Object resourcesRaw = task.get("resources");
                if (resourcesRaw instanceof List<?> resources) {
                    for (Object resourceRaw : resources) {
                        if (resourceRaw instanceof Map<?, ?> resource) {
                            String resTitle = htmlEscape(String.valueOf(resource.get("title")));
                            String resUrl = htmlEscape(String.valueOf(resource.get("url")));
                            weeks.append("<div class=\"resource\"><a href=\"").append(resUrl).append("\">")
                                    .append(resTitle).append("</a></div>");
                        }
                    }
                }
                weeks.append("</li>");
            }
            weeks.append("</ul>");
        }

        return """
                <!DOCTYPE html>
                <html>
                <head>
                <meta charset="UTF-8">
                <title>My Career Roadmap</title>
                <style>
                  body { font-family: -apple-system, Segoe UI, Arial, sans-serif; max-width: 720px; margin: 40px auto; color: #1e293b; }
                  h1 { color: #0ea5e9; }
                  h2 { margin-top: 28px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
                  ul { list-style: none; padding: 0; }
                  li { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
                  li.done strong { color: #16a34a; }
                  li.pending strong { color: #1e293b; }
                  .desc { color: #64748b; font-size: 14px; margin-top: 4px; }
                  .resource { font-size: 13px; margin-top: 4px; }
                  .resource a { color: #0ea5e9; text-decoration: none; }
                  .progress { font-size: 18px; font-weight: bold; margin: 16px 0; }
                  @media print { body { margin: 0; } }
                </style>
                </head>
                <body>
                <h1>My Career Roadmap</h1>
                <p class="progress">Progress: %d / %d tasks complete (%d%%)</p>
                %s
                </body>
                </html>
                """.formatted(completedCount, total, pct, weeks.toString());
    }

    private String htmlEscape(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
