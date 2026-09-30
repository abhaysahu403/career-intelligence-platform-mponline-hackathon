package com.cip.recommendation.dto;

import lombok.*;

public class CourseDtos {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SaveCourseRequest {
        private Long courseId;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateProgressRequest {
        private Long courseId;
        private String status; // SAVED, IN_PROGRESS, COMPLETED
    }
}
