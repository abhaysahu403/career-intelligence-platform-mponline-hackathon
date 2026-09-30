package com.cip.resume.dto;

import lombok.*;

import java.util.List;

public class ResumeBuilderDtos {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ProjectInput {
        private String name;
        private String techStack;
        private String description;
        private String githubLink;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class InternshipInput {
        private String company;
        private String duration;
        private String role;
        private List<String> bullets;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class GenerateRequest {
        private String templateId; // CLEAN_PROFESSIONAL, MODERN_TECH, EXECUTIVE
        private String targetRole;
        private List<ProjectInput> projects;
        private List<InternshipInput> internships;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ImproveSectionRequest {
        private String sectionType;
        private String originalContent;
        private String targetRole;
    }
}
