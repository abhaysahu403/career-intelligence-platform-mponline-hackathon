package com.cip.student.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

public class StudentDtos {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String phone;
        private String institution;
        private String department;
        private Integer graduationYear;
        private String linkedinUrl;
        private String githubUrl;
        private Object skills;
        private Object academicData;
        private Object workExperience;
        private Object certifications;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProfileResponse {
        private Long userId;
        private String name;
        private String email;
        private String phone;
        private String institution;
        private String department;
        private Integer graduationYear;
        private String linkedinUrl;
        private String githubUrl;
        private String slug;
        private Object skills;
        private Object academicData;
        private Object workExperience;
        private Object certifications;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PublicProfileResponse {
        private String name;
        private String slug;
        private String collegeName;
        private String branch;
        private Integer graduationYear;
        private String linkedinUrl;
        private String githubUrl;
        private List<String> skills;
        private Double readiness;
        private String level;
        private Integer certificationsCount;
        private List<String> certificationNames;
        private Integer hackathonWins;
        private Integer internshipsCount;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SkillDto {
        private String name;
        private String proficiency; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
        private Integer yearsExperience;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AcademicDataDto {
        private Double cgpa;
        private Integer currentSemester;
        private Integer totalSemesters;
        private List<String> subjects;
        private List<String> achievements;
        private String degree;
        private String specialization;
    }
}
