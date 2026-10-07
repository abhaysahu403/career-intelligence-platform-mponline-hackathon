package com.cip.job.service;

import com.cip.job.entity.GovernmentJob;
import com.cip.job.entity.Job;
import com.cip.job.repository.GovernmentJobRepository;
import com.cip.job.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Aggregates real job-posting data into the same 7 career-track codes the
 * career-path-discovery quiz (cip-ml) scores students into, so the quiz's
 * results can show real open-position counts and salary ranges instead of
 * invented numbers. Keyword matching, not ML — deliberately simple and fast.
 */
@Service
@RequiredArgsConstructor
public class CareerTrackService {

    private final JobRepository jobRepository;
    private final GovernmentJobRepository governmentJobRepository;

    private static final Map<String, String> TRACK_LABELS = new LinkedHashMap<>() {{
        put("SOFTWARE_DEV", "Software Development");
        put("DATA_AI", "Data & AI");
        put("DEVOPS_CLOUD", "DevOps & Cloud");
        put("QA_TESTING", "QA & Testing");
        put("CORE_ENGINEERING", "Core Engineering");
        put("GOVERNMENT_SERVICES", "Government Services");
        put("BANKING", "Banking & Finance");
    }};

    // Checked in this order — first keyword match wins, so put the more specific tracks first.
    private static final List<Map.Entry<String, List<String>>> TRACK_KEYWORDS = List.of(
            Map.entry("QA_TESTING", List.of("qa ", "qa-", "quality", "sdet", " test")),
            Map.entry("DATA_AI", List.of("data analyst", "data scientist", "data engineer", "machine learning", "ml engineer")),
            Map.entry("DEVOPS_CLOUD", List.of("devops", "cloud", "platform engineer", "infrastructure", "sre")),
            Map.entry("CORE_ENGINEERING", List.of("mechanical", "civil engineer", "electrical", "core engineer")),
            Map.entry("SOFTWARE_DEV", List.of("software", "sde", "developer", "full stack", "backend", "frontend",
                    "android", "ios", "programmer", "engineer"))
    );

    private static final Pattern RANGE_LPA = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*-\\s*(\\d+(?:\\.\\d+)?)\\s*LPA", Pattern.CASE_INSENSITIVE);
    private static final Pattern SINGLE_LPA = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*LPA", Pattern.CASE_INSENSITIVE);

    public List<Map<String, Object>> getTrackStats() {
        Map<String, List<Job>> privateByTrack = new LinkedHashMap<>();
        for (Job job : jobRepository.findAllByActiveTrue()) {
            String track = matchTrack(job.getRole());
            if (track != null) {
                privateByTrack.computeIfAbsent(track, k -> new ArrayList<>()).add(job);
            }
        }

        List<GovernmentJob> govJobs = governmentJobRepository.findByActiveTrue();
        Map<String, List<GovernmentJob>> govByTrack = new LinkedHashMap<>();
        for (GovernmentJob gj : govJobs) {
            String track = "BANKING".equals(gj.getCategory()) ? "BANKING" : "GOVERNMENT_SERVICES";
            govByTrack.computeIfAbsent(track, k -> new ArrayList<>()).add(gj);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (String code : TRACK_LABELS.keySet()) {
            List<Job> privateJobs = privateByTrack.getOrDefault(code, List.of());
            List<GovernmentJob> govJobsForTrack = govByTrack.getOrDefault(code, List.of());

            List<Double> salaries = new ArrayList<>();
            for (Job j : privateJobs) {
                Double parsed = parseAvgSalaryLpa(j.getSalaryRange());
                if (parsed != null) salaries.add(parsed);
            }

            List<Map<String, Object>> sampleListings = new ArrayList<>();
            privateJobs.stream().limit(3).forEach(j -> sampleListings.add(Map.of(
                    "company", j.getCompany(), "role", j.getRole(), "sourceUrl", j.getSourceUrl() != null ? j.getSourceUrl() : "")));
            if (sampleListings.size() < 3) {
                govJobsForTrack.stream().limit(3 - sampleListings.size()).forEach(gj -> sampleListings.add(Map.of(
                        "company", gj.getOrganization(), "role", gj.getTitle(), "sourceUrl", gj.getApplicationLink())));
            }

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("code", code);
            entry.put("label", TRACK_LABELS.get(code));
            entry.put("openPositions", privateJobs.size() + govJobsForTrack.size());
            entry.put("avgSalaryLpa", salaries.isEmpty() ? null :
                    Math.round(salaries.stream().mapToDouble(Double::doubleValue).average().orElse(0) * 10) / 10.0);
            entry.put("sampleListings", sampleListings);
            result.add(entry);
        }
        return result;
    }

    private String matchTrack(String role) {
        if (role == null) return null;
        String lower = " " + role.toLowerCase() + " ";
        for (Map.Entry<String, List<String>> entry : TRACK_KEYWORDS) {
            for (String keyword : entry.getValue()) {
                if (lower.contains(keyword)) return entry.getKey();
            }
        }
        return null;
    }

    private Double parseAvgSalaryLpa(String salaryRange) {
        if (salaryRange == null || salaryRange.toLowerCase().contains("/month")) return null;
        Matcher range = RANGE_LPA.matcher(salaryRange);
        if (range.find()) {
            return (Double.parseDouble(range.group(1)) + Double.parseDouble(range.group(2))) / 2;
        }
        Matcher single = SINGLE_LPA.matcher(salaryRange);
        if (single.find()) {
            return Double.parseDouble(single.group(1));
        }
        return null;
    }
}
