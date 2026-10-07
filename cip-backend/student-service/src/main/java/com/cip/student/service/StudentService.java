package com.cip.student.service;

import com.cip.common.exception.CipException;
import com.cip.student.dto.AcademicProfileDtos;
import com.cip.student.dto.StudentDtos;
import com.cip.student.entity.StudentProfile;
import com.cip.student.repository.StudentProfileRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentProfileRepository profileRepository;
    private final AcademicProfileService academicProfileService;
    private final PublicProfileClient publicProfileClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String toJsonString(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize object to JSON", e);
            return null;
        }
    }

    @Cacheable(value = "student-profile", key = "#userId")
    public StudentDtos.ProfileResponse getProfile(Long userId) {
        StudentProfile profile = profileRepository.findById(userId)
                .orElseThrow(() -> CipException.notFound("Student profile"));
        return toProfileResponse(profile);
    }

    @Transactional
    @CacheEvict(value = "student-profile", key = "#userId")
    public StudentDtos.ProfileResponse createOrUpdateProfile(Long userId, String name,
                                                              String email,
                                                              StudentDtos.UpdateProfileRequest request) {
        StudentProfile profile = profileRepository.findById(userId)
                .orElse(StudentProfile.builder()
                        .userId(userId)
                        .name(name)
                        .email(email)
                        .build());

        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getInstitution() != null) profile.setInstitution(request.getInstitution());
        if (request.getDepartment() != null) profile.setDepartment(request.getDepartment());
        if (request.getGraduationYear() != null) profile.setGraduationYear(request.getGraduationYear());
        if (request.getLinkedinUrl() != null) profile.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getGithubUrl() != null) profile.setGithubUrl(request.getGithubUrl());
        if (request.getSkills() != null) profile.setSkills(toJsonString(request.getSkills()));
        if (request.getAcademicData() != null) profile.setAcademicData(toJsonString(request.getAcademicData()));
        if (request.getWorkExperience() != null) profile.setWorkExperience(toJsonString(request.getWorkExperience()));
        if (request.getCertifications() != null) profile.setCertifications(toJsonString(request.getCertifications()));
        if (profile.getSlug() == null) {
            profile.setSlug(generateUniqueSlug(profile.getName()));
        }

        profile = profileRepository.save(profile);
        log.info("Updated student profile for userId={}", userId);

        return toProfileResponse(profile);
    }

    private String generateUniqueSlug(String name) {
        String base = (name == null || name.isBlank() ? "student" : name)
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-");
        if (base.isBlank()) base = "student";
        String candidate = base;
        int suffix = 2;
        while (profileRepository.existsBySlug(candidate)) {
            candidate = base + "-" + suffix;
            suffix++;
        }
        return candidate;
    }

    public List<StudentDtos.StudentSkillsResponse> getAllSkills() {
        return profileRepository.findBySkillsIsNotNull().stream()
                .map(profile -> {
                    List<String> skills = Collections.emptyList();
                    try {
                        skills = objectMapper.readValue(profile.getSkills(), new TypeReference<List<String>>() {});
                    } catch (Exception ignored) {
                    }
                    return StudentDtos.StudentSkillsResponse.builder()
                            .userId(profile.getUserId())
                            .skills(skills)
                            .build();
                })
                .toList();
    }

    @SuppressWarnings("unchecked")
    public StudentDtos.PublicProfileResponse getPublicProfile(String slug) {
        StudentProfile profile = profileRepository.findBySlug(slug)
                .orElseThrow(() -> CipException.notFound("Public profile"));

        AcademicProfileDtos.Response academic;
        try {
            academic = academicProfileService.get(profile.getUserId());
        } catch (Exception e) {
            academic = null;
        }

        Map<String, Object> score = publicProfileClient.getScore(profile.getUserId());
        List<Map<String, Object>> certificates = publicProfileClient.getValidatedCertificates(profile.getUserId());

        List<String> skills = Collections.emptyList();
        if (profile.getSkills() != null) {
            try {
                skills = objectMapper.readValue(profile.getSkills(), new TypeReference<List<String>>() {});
            } catch (Exception ignored) {
            }
        }

        return StudentDtos.PublicProfileResponse.builder()
                .name(profile.getName())
                .slug(profile.getSlug())
                .collegeName(academic != null ? academic.collegeName : profile.getInstitution())
                .branch(academic != null ? academic.branch : profile.getDepartment())
                .graduationYear(profile.getGraduationYear())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .skills(skills)
                .readiness(score.get("readiness") != null ? ((Number) score.get("readiness")).doubleValue() : null)
                .level((String) score.get("level"))
                .certificationsCount(certificates.size())
                .certificationNames(certificates.stream().map(c -> (String) c.get("fileName")).toList())
                .hackathonWins(academic != null ? academic.hackathonWins : null)
                .internshipsCount(academic != null ? academic.internshipsCount : null)
                .build();
    }

    private StudentDtos.ProfileResponse toProfileResponse(StudentProfile p) {
        return StudentDtos.ProfileResponse.builder()
                .userId(p.getUserId())
                .name(p.getName())
                .email(p.getEmail())
                .phone(p.getPhone())
                .institution(p.getInstitution())
                .department(p.getDepartment())
                .graduationYear(p.getGraduationYear())
                .linkedinUrl(p.getLinkedinUrl())
                .githubUrl(p.getGithubUrl())
                .slug(p.getSlug())
                .skills(p.getSkills())
                .academicData(p.getAcademicData())
                .workExperience(p.getWorkExperience())
                .certifications(p.getCertifications())
                .build();
    }
}
