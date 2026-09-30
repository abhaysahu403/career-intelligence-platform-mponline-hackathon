package com.cip.student.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "student_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfile {

    @Id
    private Long userId; // Same as user ID in auth service

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;
    private String institution;
    private String department;
    private Integer graduationYear;
    private String linkedinUrl;
    private String githubUrl;

    @Column(unique = true, length = 120)
    private String slug;

    @Column(columnDefinition = "text")
    private String skills; // JSON array as string

    @Column(columnDefinition = "text")
    private String academicData; // JSON object as string

    @Column(columnDefinition = "text")
    private String workExperience; // JSON array as string

    @Column(columnDefinition = "text")
    private String certifications; // JSON array as string

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
