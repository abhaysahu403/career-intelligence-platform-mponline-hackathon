package com.cip.interview.service;

import com.cip.interview.entity.BranchQuestion;
import com.cip.interview.entity.CompanyQuestion;
import com.cip.interview.entity.GovernmentInterviewQuestion;
import com.cip.interview.repository.BranchQuestionRepository;
import com.cip.interview.repository.CompanyQuestionRepository;
import com.cip.interview.repository.GovernmentInterviewQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionBankService {

    private final CompanyQuestionRepository companyQuestionRepository;
    private final BranchQuestionRepository branchQuestionRepository;
    private final GovernmentInterviewQuestionRepository governmentInterviewQuestionRepository;

    private static final List<String> GOVERNMENT_EXAM_TYPES =
            List.of("SSB", "UPSC", "BANK_PO", "SSC_RAILWAY", "RESEARCH_ORG");

    public List<CompanyQuestion> getCompanyQuestions(String companyName, String difficulty) {
        return difficulty == null
                ? companyQuestionRepository.findByCompanyNameIgnoreCase(companyName)
                : companyQuestionRepository.findByCompanyNameIgnoreCaseAndDifficultyIgnoreCase(companyName, difficulty);
    }

    public List<BranchQuestion> getBranchQuestions(String branch, String difficulty) {
        return difficulty == null
                ? branchQuestionRepository.findByBranchIgnoreCase(branch)
                : branchQuestionRepository.findByBranchIgnoreCaseAndDifficultyIgnoreCase(branch, difficulty);
    }

    public List<String> getCompanies() {
        return companyQuestionRepository.findDistinctCompanyNames();
    }

    public List<String> getBranches() {
        return branchQuestionRepository.findDistinctBranches();
    }

    public List<GovernmentInterviewQuestion> getGovernmentQuestions(String examType, String difficulty) {
        return difficulty == null
                ? governmentInterviewQuestionRepository.findByExamTypeIgnoreCase(examType)
                : governmentInterviewQuestionRepository.findByExamTypeIgnoreCaseAndDifficultyIgnoreCase(examType, difficulty);
    }

    public List<String> getGovernmentExamTypes() {
        return GOVERNMENT_EXAM_TYPES;
    }
}
