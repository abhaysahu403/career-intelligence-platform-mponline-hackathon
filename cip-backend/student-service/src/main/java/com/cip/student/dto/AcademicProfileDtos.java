package com.cip.student.dto;

public class AcademicProfileDtos {

    public static class SaveRequest {
        public String collegeName;
        public String branch;
        public Integer yearOfStudy;
        public Integer graduationYear;
        public Double currentCgpa;
        public Double tenthPercentage;
        public String tenthBoard;
        public Double twelfthPercentage;
        public String twelfthStream;
        public Integer activeBacklogs;
        public Boolean gapYear;
        public Integer internshipsCount;
        public Integer hackathonWins;
        public String targetRoleType;
        public Boolean willingToRelocate;
    }

    public static class Response {
        public Long userId;
        public String collegeName;
        public String branch;
        public Integer yearOfStudy;
        public Integer graduationYear;
        public Double currentCgpa;
        public Double tenthPercentage;
        public String tenthBoard;
        public Double twelfthPercentage;
        public String twelfthStream;
        public Integer activeBacklogs;
        public boolean gapYear;
        public Integer internshipsCount;
        public Integer hackathonWins;
        public String targetRoleType;
        public boolean willingToRelocate;
        public double academicScore;
        public double experienceScore;
    }

    public static class CompletenessResponse {
        public int completenessPercent;
        public int filledFields;
        public int totalFields;
        public String message;
    }
}
