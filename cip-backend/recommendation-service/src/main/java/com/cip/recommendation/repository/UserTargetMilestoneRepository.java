package com.cip.recommendation.repository;

import com.cip.recommendation.entity.UserTargetMilestone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserTargetMilestoneRepository extends JpaRepository<UserTargetMilestone, Long> {
    List<UserTargetMilestone> findByUserIdAndTargetCode(Long userId, String targetCode);
    Optional<UserTargetMilestone> findByUserIdAndTargetCodeAndMilestoneIndex(Long userId, String targetCode, Integer milestoneIndex);
}
