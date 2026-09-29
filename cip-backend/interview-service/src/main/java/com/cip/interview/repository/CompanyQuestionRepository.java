package com.cip.interview.repository;

import com.cip.interview.entity.CompanyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CompanyQuestionRepository extends JpaRepository<CompanyQuestion, Long> {

    List<CompanyQuestion> findByCompanyNameIgnoreCase(String companyName);

    List<CompanyQuestion> findByCompanyNameIgnoreCaseAndDifficultyIgnoreCase(String companyName, String difficulty);

    @Query("SELECT DISTINCT c.companyName FROM CompanyQuestion c ORDER BY c.companyName")
    List<String> findDistinctCompanyNames();
}
