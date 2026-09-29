package com.cip.interview.repository;

import com.cip.interview.entity.FacialAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacialAnalyticsRepository extends JpaRepository<FacialAnalytics, Long> {
    List<FacialAnalytics> findByInterviewIdOrderByRecordedAtAsc(Long interviewId);
}
