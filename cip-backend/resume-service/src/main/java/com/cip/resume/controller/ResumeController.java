package com.cip.resume.controller;

import com.cip.common.dto.ApiResponse;
import com.cip.resume.dto.ResumeBuilderDtos;
import com.cip.resume.entity.Resume;
import com.cip.resume.service.ResumeBuilderService;
import com.cip.resume.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;
    private final ResumeBuilderService resumeBuilderService;

    /** POST /resume/generate — assemble the resume from profile data + AI-written content */
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateResume(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody ResumeBuilderDtos.GenerateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeBuilderService.generate(userId, request)));
    }

    /** GET /resume/builder — the last generated resume (for re-opening the builder/preview) */
    @GetMapping("/builder")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBuilderResume(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(ApiResponse.success(resumeBuilderService.getLatest(userId)));
    }

    /** POST /resume/improve-section — "Improve with AI" button on any section */
    @PostMapping("/improve-section")
    public ResponseEntity<ApiResponse<Map<String, Object>>> improveSection(
            @RequestBody ResumeBuilderDtos.ImproveSectionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeBuilderService.improveSection(request)));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Resume>> upload(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam("file") MultipartFile file) throws IOException {
        Resume resume = resumeService.uploadResume(userId, file);
        return ResponseEntity.ok(ApiResponse.success("Resume uploaded. Parsing in progress.", resume));
    }

    @PostMapping(value = "/upload-text", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Resume>> uploadText(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody UploadTextRequest request) throws IOException {
        Resume resume = resumeService.uploadResumeText(userId, request.getFileName(), request.getText());
        return ResponseEntity.ok(ApiResponse.success("Resume text uploaded successfully.", resume));
    }

    @lombok.Data
    public static class UploadTextRequest {
        private String fileName;
        private String text;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Resume>>> getResumes(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.getResumes(userId)));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<Resume>> getLatest(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.getLatestResume(userId)));
    }
}
