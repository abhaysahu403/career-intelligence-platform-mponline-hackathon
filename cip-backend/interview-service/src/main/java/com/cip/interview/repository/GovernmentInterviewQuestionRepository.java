package com.cip.interview.repository;

import com.cip.interview.entity.GovernmentInterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GovernmentInterviewQuestionRepository extends JpaRepository<GovernmentInterviewQuestion, Long> {
    List<GovernmentInterviewQuestion> findByExamTypeIgnoreCase(String examType);
    List<GovernmentInterviewQuestion> findByExamTypeIgnoreCaseAndDifficultyIgnoreCase(String examType, String difficulty);
}
