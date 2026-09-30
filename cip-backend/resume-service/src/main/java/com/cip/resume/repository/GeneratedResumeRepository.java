package com.cip.resume.repository;

import com.cip.resume.entity.GeneratedResume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GeneratedResumeRepository extends JpaRepository<GeneratedResume, Long> {
    Optional<GeneratedResume> findByUserId(Long userId);
}
