package com.cip.student.repository;

import com.cip.student.entity.AcademicProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AcademicProfileRepository extends JpaRepository<AcademicProfile, Long> {
    Optional<AcademicProfile> findByUserId(Long userId);
}
