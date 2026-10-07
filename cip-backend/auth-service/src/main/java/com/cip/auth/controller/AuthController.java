package com.cip.auth.controller;

import com.cip.auth.dto.AuthDtos;
import com.cip.auth.service.AuthService;
import com.cip.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthDtos.AuthResponse>> signup(
            @Valid @RequestBody AuthDtos.SignupRequest request) {
        AuthDtos.AuthResponse response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDtos.AuthResponse>> login(
            @Valid @RequestBody AuthDtos.LoginRequest request) {
        AuthDtos.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthDtos.UserProfile>> getProfile(
            @RequestHeader("X-User-Email") String email) {
        AuthDtos.UserProfile profile = authService.getProfile(email);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<java.util.List<AuthDtos.UserProfile>>> listUsers(
            @RequestParam(defaultValue = "STUDENT") String role,
            @RequestHeader("X-User-Role") String requesterRole) {
        if (!"ADMIN".equals(requesterRole) && !"FACULTY".equals(requesterRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Admin or faculty access required"));
        }
        return ResponseEntity.ok(ApiResponse.success(authService.listByRole(role)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}
