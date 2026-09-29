package com.cip.job.service;

import com.cip.common.exception.CipException;
import com.cip.job.entity.GovernmentJob;
import com.cip.job.repository.GovernmentJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GovernmentJobService {

    private final GovernmentJobRepository governmentJobRepository;

    public List<GovernmentJob> getAll(String category) {
        return category != null
                ? governmentJobRepository.findByActiveTrueAndCategory(category)
                : governmentJobRepository.findByActiveTrue();
    }

    public GovernmentJob getById(Long id) {
        return governmentJobRepository.findById(id)
                .orElseThrow(() -> CipException.notFound("Government job"));
    }

    /**
     * Deterministic weighted match score (no AI needed):
     * branch 40%, cgpa threshold 30%, graduation-year eligibility 20%, preference alignment 10%.
     */
    public List<Map<String, Object>> recommend(String branch, Double cgpa, Integer graduationYear,
                                                List<String> preferences) {
        List<Map<String, Object>> scored = governmentJobRepository.findByActiveTrue().stream()
                .map(job -> {
                    double score = 0;
                    score += branchScore(job, branch);
                    score += cgpaScore(job, cgpa);
                    score += graduationYearScore(graduationYear);
                    score += preferenceScore(job, preferences);

                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("job", job);
                    entry.put("matchScore", Math.round(score));
                    entry.put("eligibilityStatus", score >= 60 ? "ELIGIBLE" : score >= 40 ? "PARTIALLY_ELIGIBLE" : "NOT_ELIGIBLE");
                    return entry;
                })
                .sorted((a, b) -> Long.compare((Long) b.get("matchScore"), (Long) a.get("matchScore")))
                .limit(10)
                .toList();
        return scored;
    }

    private double branchScore(GovernmentJob job, String branch) {
        if (branch == null || job.getEligibleBranches() == null) return 0;
        boolean matches = Arrays.stream(job.getEligibleBranches())
                .anyMatch(b -> "ALL".equalsIgnoreCase(b) || b.equalsIgnoreCase(branch));
        return matches ? 40 : 0;
    }

    private double cgpaScore(GovernmentJob job, Double cgpa) {
        if (job.getMinCgpa() == null) return 30; // no CGPA requirement for this scheme
        if (cgpa == null) return 0;
        if (cgpa >= job.getMinCgpa()) return 30;
        if (cgpa >= job.getMinCgpa() - 0.5) return 15; // close to threshold
        return 0;
    }

    private double graduationYearScore(Integer graduationYear) {
        if (graduationYear == null) return 10;
        int currentYear = Year.now().getValue();
        return graduationYear <= currentYear ? 20 : 10; // already graduated vs. about to graduate
    }

    private double preferenceScore(GovernmentJob job, List<String> preferences) {
        if (preferences == null || preferences.isEmpty()) return 10; // neutral if no preference given
        boolean matches = preferences.stream().anyMatch(p ->
                job.getCategory().equalsIgnoreCase(p) ||
                (job.getTags() != null && Arrays.stream(job.getTags()).anyMatch(t -> t.equalsIgnoreCase(p))));
        return matches ? 10 : 0;
    }
}
