package com.cip.student.service;

import com.cip.common.exception.CipException;
import com.cip.student.dto.AcademicProfileDtos;
import com.cip.student.entity.AcademicProfile;
import com.cip.student.entity.StudentProfile;
import com.cip.student.repository.AcademicProfileRepository;
import com.cip.student.repository.StudentProfileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Owns the structured academic profile (CGPA, marks, backlogs, achievements) that feeds:
 * - the readiness score formula (via ScoreClient push to score-service)
 * - government job CGPA eligibility filtering (job-service reads currentCgpa directly)
 * - course recommendations (branch + year of study)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AcademicProfileService {

    private final AcademicProfileRepository academicProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ScoreClient scoreClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public AcademicProfileDtos.Response save(Long userId, AcademicProfileDtos.SaveRequest request) {
        AcademicProfile profile = academicProfileRepository.findByUserId(userId)
                .orElse(AcademicProfile.builder().userId(userId).createdAt(LocalDateTime.now()).build());

        if (request.collegeName != null) profile.setCollegeName(request.collegeName);
        if (request.branch != null) profile.setBranch(request.branch);
        if (request.yearOfStudy != null) profile.setYearOfStudy(request.yearOfStudy);
        if (request.graduationYear != null) profile.setGraduationYear(request.graduationYear);
        if (request.currentCgpa != null) profile.setCurrentCgpa(request.currentCgpa);
        if (request.tenthPercentage != null) profile.setTenthPercentage(request.tenthPercentage);
        if (request.tenthBoard != null) profile.setTenthBoard(request.tenthBoard);
        if (request.twelfthPercentage != null) profile.setTwelfthPercentage(request.twelfthPercentage);
        if (request.twelfthStream != null) profile.setTwelfthStream(request.twelfthStream);
        if (request.activeBacklogs != null) profile.setActiveBacklogs(request.activeBacklogs);
        if (request.gapYear != null) profile.setGapYear(request.gapYear);
        if (request.internshipsCount != null) profile.setInternshipsCount(request.internshipsCount);
        if (request.hackathonWins != null) profile.setHackathonWins(request.hackathonWins);
        if (request.targetRoleType != null) profile.setTargetRoleType(request.targetRoleType);
        if (request.willingToRelocate != null) profile.setWillingToRelocate(request.willingToRelocate);
        profile.setUpdatedAt(LocalDateTime.now());

        profile = academicProfileRepository.save(profile);
        log.info("Saved academic profile for userId={}, branch={}, cgpa={}", userId, profile.getBranch(), profile.getCurrentCgpa());

        double academicScore = computeAcademicScore(profile);
        double experienceScore = computeExperienceScore(profile);
        double certificationsScore = computeCertificationsScore(userId);
        scoreClient.pushAcademicScores(userId, academicScore, certificationsScore, experienceScore);

        return toResponse(profile, academicScore, experienceScore);
    }

    public AcademicProfileDtos.Response get(Long userId) {
        AcademicProfile profile = academicProfileRepository.findByUserId(userId)
                .orElseThrow(() -> CipException.notFound("Academic profile"));
        return toResponse(profile, computeAcademicScore(profile), computeExperienceScore(profile));
    }

    public List<AcademicProfileDtos.Response> getAll() {
        return academicProfileRepository.findAll().stream()
                .map(p -> toResponse(p, computeAcademicScore(p), computeExperienceScore(p)))
                .toList();
    }

    public AcademicProfileDtos.CompletenessResponse getCompleteness(Long userId) {
        AcademicProfile profile = academicProfileRepository.findByUserId(userId).orElse(null);
        int totalFields = 13;
        int filled = 0;
        if (profile != null) {
            if (profile.getCollegeName() != null) filled++;
            if (profile.getBranch() != null) filled++;
            if (profile.getYearOfStudy() != null) filled++;
            if (profile.getGraduationYear() != null) filled++;
            if (profile.getCurrentCgpa() != null) filled++;
            if (profile.getTenthPercentage() != null) filled++;
            if (profile.getTenthBoard() != null) filled++;
            if (profile.getTwelfthPercentage() != null) filled++;
            if (profile.getTwelfthStream() != null) filled++;
            filled++; // activeBacklogs always has a default value
            filled++; // gapYear always has a default value
            filled++; // internshipsCount always has a default value
            if (profile.getTargetRoleType() != null) filled++;
        }
        int percent = (int) Math.round((filled * 100.0) / totalFields);
        AcademicProfileDtos.CompletenessResponse response = new AcademicProfileDtos.CompletenessResponse();
        response.completenessPercent = percent;
        response.filledFields = filled;
        response.totalFields = totalFields;
        response.message = percent >= 100
                ? "Academic profile complete!"
                : "Profile " + percent + "% complete — finish your academic profile to unlock personalized job & course matches.";
        return response;
    }

    /**
     * Academic Score = CGPA normalized (40%) + 10th% (20%) + 12th% (20%)
     *                  - 10 per active backlog + 5 per hackathon win + 3 per internship
     */
    private double computeAcademicScore(AcademicProfile p) {
        double cgpaComponent = p.getCurrentCgpa() != null ? Math.min(100, p.getCurrentCgpa() * 10) * 0.4 : 0;
        double tenthComponent = p.getTenthPercentage() != null ? Math.min(100, p.getTenthPercentage()) * 0.2 : 0;
        double twelfthComponent = p.getTwelfthPercentage() != null ? Math.min(100, p.getTwelfthPercentage()) * 0.2 : 0;
        double backlogPenalty = (p.getActiveBacklogs() != null ? p.getActiveBacklogs() : 0) * 10.0;
        double achievementBonus = (p.getHackathonWins() != null ? p.getHackathonWins() : 0) * 5.0
                + (p.getInternshipsCount() != null ? p.getInternshipsCount() : 0) * 3.0;
        return clamp(cgpaComponent + tenthComponent + twelfthComponent - backlogPenalty + achievementBonus);
    }

    /** Normalized internship count, feeds the overall readiness formula's Experience(10%) component. */
    private double computeExperienceScore(AcademicProfile p) {
        int internships = p.getInternshipsCount() != null ? p.getInternshipsCount() : 0;
        return clamp(internships * 30.0);
    }

    @SuppressWarnings("unchecked")
    double computeCertificationsScore(Long userId) {
        return studentProfileRepository.findById(userId)
                .map(StudentProfile::getCertifications)
                .map(json -> {
                    try {
                        List<Object> certs = objectMapper.readValue(json, List.class);
                        return clamp(certs.size() * 20.0);
                    } catch (Exception e) {
                        return 0.0;
                    }
                })
                .orElse(0.0);
    }

    private double clamp(double val) {
        return Math.max(0, Math.min(100, val));
    }

    private AcademicProfileDtos.Response toResponse(AcademicProfile p, double academicScore, double experienceScore) {
        AcademicProfileDtos.Response r = new AcademicProfileDtos.Response();
        r.userId = p.getUserId();
        r.collegeName = p.getCollegeName();
        r.branch = p.getBranch();
        r.yearOfStudy = p.getYearOfStudy();
        r.graduationYear = p.getGraduationYear();
        r.currentCgpa = p.getCurrentCgpa();
        r.tenthPercentage = p.getTenthPercentage();
        r.tenthBoard = p.getTenthBoard();
        r.twelfthPercentage = p.getTwelfthPercentage();
        r.twelfthStream = p.getTwelfthStream();
        r.activeBacklogs = p.getActiveBacklogs();
        r.gapYear = p.isGapYear();
        r.internshipsCount = p.getInternshipsCount();
        r.hackathonWins = p.getHackathonWins();
        r.targetRoleType = p.getTargetRoleType();
        r.willingToRelocate = p.isWillingToRelocate();
        r.academicScore = academicScore;
        r.experienceScore = experienceScore;
        return r;
    }
}
