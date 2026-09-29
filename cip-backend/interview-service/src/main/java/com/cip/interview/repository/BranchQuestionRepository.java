package com.cip.interview.repository;

import com.cip.interview.entity.BranchQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BranchQuestionRepository extends JpaRepository<BranchQuestion, Long> {

    List<BranchQuestion> findByBranchIgnoreCase(String branch);

    List<BranchQuestion> findByBranchIgnoreCaseAndDifficultyIgnoreCase(String branch, String difficulty);

    @Query("SELECT DISTINCT b.branch FROM BranchQuestion b ORDER BY b.branch")
    List<String> findDistinctBranches();
}
