package com.carswap.backend.service;

import com.carswap.backend.dto.AuthenticationRequest;
import com.carswap.backend.dto.AuthenticationResponse;
import com.carswap.backend.dto.RegisterRequest;
import com.carswap.backend.model.Role;
import com.carswap.backend.model.User;
import com.carswap.backend.repository.UserRepository;
import com.carswap.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

        private final UserRepository repository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        // Note: Registration is handled by Supabase. This method is not currently used.
        /*
         * public AuthenticationResponse register(RegisterRequest request) {
         * var user = User.builder()
         * .email(request.getEmail())
         * .build();
         * repository.save(user);
         * var jwtToken = jwtService.generateToken(user);
         * return AuthenticationResponse.builder()
         * .token(jwtToken)
         * .build();
         * }
         */

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                var user = repository.findByEmail(request.getEmail())
                                .orElseThrow();
                var jwtToken = jwtService.generateToken(user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .build();
        }
}
