package com.cip.job.repository;

import com.cip.job.entity.GovernmentJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GovernmentJobRepository extends JpaRepository<GovernmentJob, Long> {
    List<GovernmentJob> findByActiveTrue();
    List<GovernmentJob> findByActiveTrueAndCategory(String category);
}
