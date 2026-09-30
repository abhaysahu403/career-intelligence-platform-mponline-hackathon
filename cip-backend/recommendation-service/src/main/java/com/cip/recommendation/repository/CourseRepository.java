package com.cip.recommendation.repository;

import com.cip.recommendation.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByActiveTrue();
    List<Course> findByActiveTrueAndGovernmentRecognizedTrue();
}
