package com.cip.recommendation.repository;

import com.cip.recommendation.entity.CareerTarget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CareerTargetRepository extends JpaRepository<CareerTarget, Long> {
    List<CareerTarget> findByActiveTrue();
    List<CareerTarget> findByActiveTrueAndTargetType(String targetType);
    Optional<CareerTarget> findByTargetCode(String targetCode);
}
