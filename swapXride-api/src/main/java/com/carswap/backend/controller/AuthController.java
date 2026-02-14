package com.carswap.backend.controller;

import com.carswap.backend.dto.AuthenticationRequest;
import com.carswap.backend.dto.AuthenticationResponse;
import com.carswap.backend.dto.RegisterRequest;
import com.carswap.backend.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService service;

    // Note: Registration is handled by Supabase. This endpoint is not currently
    // used.
    /*
     * @PostMapping("/register")
     * public ResponseEntity<AuthenticationResponse> register(
     * 
     * @RequestBody RegisterRequest request) {
     * return ResponseEntity.ok(service.register(request));
     * }
     */

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }
}
