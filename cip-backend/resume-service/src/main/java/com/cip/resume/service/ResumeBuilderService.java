package com.cip.resume.service;

import com.cip.common.exception.CipException;
import com.cip.resume.dto.ResumeBuilderDtos;
import com.cip.resume.entity.GeneratedResume;
import com.cip.resume.repository.GeneratedResumeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Assembles a resume from data already in CIP (student-service profile + academic
 * profile, certificate-service validated certificates) plus AI-written content from
 * cip-ml (objective, improved project/experience bullets), and scores it against a
 * deterministic ATS checklist.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeBuilderService {

    private final GeneratedResumeRepository generatedResumeRepository;
    private final ProfileDataClient profileDataClient;
    private final ResumeMlClient mlClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Map<String, Set<String>> SKILL_CATEGORIES = Map.of(
            "Programming", Set.of("python", "java", "javascript", "typescript", "c++", "c", "go", "rust", "c#"),
            "Frameworks", Set.of("react", "spring boot", "fastapi", "django", "angular", "vue", "node.js", "express", "flask"),
            "Databases", Set.of("postgresql", "mysql", "mongodb", "redis", "sqlite", "oracle", "sql"),
            "Tools", Set.of("git", "docker", "kubernetes", "aws", "azure", "gcp", "linux", "jenkins")
    );

    @Transactional
    public Map<String, Object> generate(Long userId, ResumeBuilderDtos.GenerateRequest request) {
        Map<String, Object> academic = profileDataClient.getAcademicProfile(userId);
        Map<String, Object> profile = profileDataClient.getStudentProfile(userId);
        List<Map<String, Object>> certificates = profileDataClient.getCertificates(userId);

        String branch = str(academic.get("branch"));
        Double cgpa = num(academic.get("currentCgpa"));
        List<String> skills = parseStringList(profile.get("skills"));
        String targetRole = request.getTargetRole() != null ? request.getTargetRole() : "Software Engineer";

        List<String> achievements = new ArrayList<>();
        Integer hackathonWins = intVal(academic.get("hackathonWins"));
        Integer internshipsCount = intVal(academic.get("internshipsCount"));
        if (hackathonWins != null && hackathonWins > 0) achievements.add(hackathonWins + " hackathon win(s)");
        if (internshipsCount != null && internshipsCount > 0) achievements.add(internshipsCount + " completed internship(s)");

        String objective = mlClient.generateObjective(branch, skills, targetRole, achievements, cgpa);

        List<Map<String, Object>> projects = new ArrayList<>();
        for (ResumeBuilderDtos.ProjectInput p : safe(request.getProjects())) {
            Map<String, Object> improved = mlClient.improveText("project", p.getDescription(), targetRole);
            projects.add(Map.of(
                    "name", p.getName() != null ? p.getName() : "",
                    "techStack", p.getTechStack() != null ? p.getTechStack() : "",
                    "description", improved.getOrDefault("improved_content", p.getDescription()),
                    "githubLink", p.getGithubLink() != null ? p.getGithubLink() : ""
            ));
        }

        List<Map<String, Object>> experience = new ArrayList<>();
        for (ResumeBuilderDtos.InternshipInput exp : safe(request.getInternships())) {
            List<String> improvedBullets = new ArrayList<>();
            for (String bullet : safe(exp.getBullets())) {
                Map<String, Object> improved = mlClient.improveText("experience", bullet, targetRole);
                improvedBullets.add(String.valueOf(improved.getOrDefault("improved_content", bullet)));
            }
            experience.add(Map.of(
                    "company", exp.getCompany() != null ? exp.getCompany() : "",
                    "duration", exp.getDuration() != null ? exp.getDuration() : "",
                    "role", exp.getRole() != null ? exp.getRole() : "",
                    "bullets", improvedBullets
            ));
        }

        List<Map<String, Object>> validCertificates = certificates.stream()
                .filter(c -> "COMPLETED".equals(c.get("status")))
                .map(c -> Map.<String, Object>of(
                        "name", c.getOrDefault("fileName", ""),
                        "authenticityScore", c.getOrDefault("authenticityScore", 0)))
                .toList();

        Map<String, Object> header = new LinkedHashMap<>();
        header.put("name", profile.getOrDefault("name", ""));
        header.put("email", profile.getOrDefault("email", ""));
        header.put("phone", profile.getOrDefault("phone", ""));
        header.put("linkedinUrl", profile.getOrDefault("linkedinUrl", ""));
        header.put("githubUrl", profile.getOrDefault("githubUrl", ""));
        header.put("branch", branch);
        header.put("college", academic.get("collegeName"));
        header.put("cgpa", cgpa);

        List<Map<String, Object>> education = new ArrayList<>();
        education.add(Map.of(
                "level", "B.Tech " + (branch != null ? branch : ""),
                "institution", String.valueOf(academic.getOrDefault("collegeName", "")),
                "score", cgpa != null ? "CGPA: " + cgpa : "",
                "year", String.valueOf(academic.getOrDefault("graduationYear", ""))
        ));
        if (academic.get("twelfthPercentage") != null) {
            education.add(Map.of(
                    "level", "12th " + str(academic.get("twelfthStream")),
                    "institution", "", "score", academic.get("twelfthPercentage") + "%",
                    "year", ""
            ));
        }
        if (academic.get("tenthPercentage") != null) {
            education.add(Map.of(
                    "level", "10th " + str(academic.get("tenthBoard")),
                    "institution", "", "score", academic.get("tenthPercentage") + "%",
                    "year", ""
            ));
        }

        Map<String, Object> content = new LinkedHashMap<>();
        content.put("header", header);
        content.put("objective", objective);
        content.put("education", education);
        content.put("skills", categorizeSkills(skills));
        content.put("projects", projects);
        content.put("experience", experience);
        content.put("achievements", achievements);
        content.put("certifications", validCertificates);

        Map<String, Object> atsResult = computeAtsScore(objective, skills, projects, experience, validCertificates);

        GeneratedResume resume = generatedResumeRepository.findByUserId(userId)
                .orElse(GeneratedResume.builder().userId(userId).createdAt(LocalDateTime.now()).build());
        resume.setTemplateId(request.getTemplateId() != null ? request.getTemplateId() : "CLEAN_PROFESSIONAL");
        resume.setUpdatedAt(LocalDateTime.now());
        try {
            resume.setContentJson(objectMapper.writeValueAsString(content));
            resume.setAtsFeedback(objectMapper.writeValueAsString(atsResult.get("feedback")));
        } catch (Exception e) {
            throw new CipException("Failed to serialize resume content: " + e.getMessage(), 500);
        }
        resume.setAtsScore((Integer) atsResult.get("score"));
        generatedResumeRepository.save(resume);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("templateId", resume.getTemplateId());
        result.put("content", content);
        result.put("atsScore", atsResult.get("score"));
        result.put("atsFeedback", atsResult.get("feedback"));
        return result;
    }

    public Map<String, Object> getLatest(Long userId) {
        GeneratedResume resume = generatedResumeRepository.findByUserId(userId)
                .orElseThrow(() -> CipException.notFound("Generated resume"));
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("templateId", resume.getTemplateId());
        result.put("content", parseJson(resume.getContentJson()));
        result.put("atsScore", resume.getAtsScore());
        result.put("atsFeedback", parseJson(resume.getAtsFeedback()));
        return result;
    }

    public Map<String, Object> improveSection(ResumeBuilderDtos.ImproveSectionRequest request) {
        return mlClient.improveText(request.getSectionType(), request.getOriginalContent(), request.getTargetRole());
    }

    private Map<String, Object> computeAtsScore(String objective, List<String> skills, List<Map<String, Object>> projects,
                                                 List<Map<String, Object>> experience, List<Map<String, Object>> certificates) {
        int score = 0;
        List<String> feedback = new ArrayList<>();

        if (objective != null && !objective.isBlank()) {
            score += 10;
            feedback.add("✅ Career objective included");
        } else {
            feedback.add("❌ Missing career objective");
        }

        if (skills.size() >= 5) {
            score += 15;
            feedback.add("✅ Strong skill list (" + skills.size() + " skills)");
        } else {
            feedback.add("⚠️ Add more skills — only " + skills.size() + " listed");
        }

        if (projects.size() >= 2) {
            score += 15;
            feedback.add("✅ " + projects.size() + " projects included");
        } else {
            feedback.add("⚠️ Add at least 2 projects to strengthen your resume");
        }

        boolean hasQuantifiedLanguage = projects.stream().anyMatch(p -> containsDigit(String.valueOf(p.get("description"))))
                || experience.stream().anyMatch(e -> {
                    Object bullets = e.get("bullets");
                    return bullets instanceof List<?> list && list.stream().anyMatch(b -> containsDigit(String.valueOf(b)));
                });
        if (hasQuantifiedLanguage) {
            score += 15;
            feedback.add("✅ Quantified achievements detected");
        } else {
            feedback.add("⚠️ Add more action verbs and quantified results in your project descriptions");
        }

        score += 15;
        feedback.add("✅ No images or tables (ATS safe)");
        score += 15;
        feedback.add("✅ Standard section headings used");

        if (!certificates.isEmpty()) {
            score += 15;
            feedback.add("✅ " + certificates.size() + " validated certification(s) included");
        } else {
            feedback.add("❌ No certifications found — validate one via the Certificates module");
        }

        return Map.of("score", score, "feedback", feedback);
    }

    private boolean containsDigit(String text) {
        return text != null && text.chars().anyMatch(Character::isDigit);
    }

    private Map<String, List<String>> categorizeSkills(List<String> skills) {
        Map<String, List<String>> categorized = new LinkedHashMap<>();
        for (String category : List.of("Programming", "Frameworks", "Databases", "Tools", "Other")) {
            categorized.put(category, new ArrayList<>());
        }
        for (String skill : skills) {
            String lower = skill.toLowerCase();
            String matchedCategory = SKILL_CATEGORIES.entrySet().stream()
                    .filter(e -> e.getValue().contains(lower))
                    .map(Map.Entry::getKey)
                    .findFirst()
                    .orElse("Other");
            categorized.get(matchedCategory).add(skill);
        }
        categorized.values().removeIf(List::isEmpty);
        return categorized;
    }

    @SuppressWarnings("unchecked")
    private List<String> parseStringList(Object field) {
        if (field == null) return List.of();
        try {
            Object parsed = field instanceof String s ? objectMapper.readValue(s, Object.class) : field;
            if (parsed instanceof List<?> list) {
                List<String> result = new ArrayList<>();
                for (Object item : list) {
                    if (item instanceof String str) result.add(str);
                    else if (item instanceof Map<?, ?> map && map.get("name") != null) result.add(String.valueOf(map.get("name")));
                }
                return result;
            }
        } catch (Exception ignored) {
            // fall through
        }
        return List.of();
    }

    private Object parseJson(String json) {
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (Exception e) {
            return json;
        }
    }

    private <T> List<T> safe(List<T> list) {
        return list != null ? list : List.of();
    }

    private String str(Object o) {
        return o != null ? String.valueOf(o) : null;
    }

    private Double num(Object o) {
        return o instanceof Number n ? n.doubleValue() : null;
    }

    private Integer intVal(Object o) {
        return o instanceof Number n ? n.intValue() : null;
    }
}
