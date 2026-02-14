package com.carswap.backend.controller;

import com.carswap.backend.dto.AuthenticationRequest;
import com.carswap.backend.dto.AuthenticationResponse;
import com.carswap.backend.dto.RegisterRequest;
import com.carswap.backend.service.AuthenticationService;
import com.carswap.backend.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.carswap.backend.config.SecurityConfig;
import org.springframework.context.annotation.Import;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockBean
        private AuthenticationService authService;

        @MockBean
        private JwtService jwtService;

        @MockBean
        private com.carswap.backend.repository.UserRepository userRepository;

        @MockBean
        private org.springframework.security.authentication.AuthenticationProvider authenticationProvider;

        @Autowired
        private ObjectMapper objectMapper;

        @Test
        void shouldAuthenticateUser() throws Exception {
                AuthenticationRequest request = AuthenticationRequest.builder()
                                .email("john@example.com")
                                .password("password")
                                .build();

                AuthenticationResponse response = AuthenticationResponse.builder()
                                .token("jwt-token")
                                .build();

                when(authService.authenticate(any(AuthenticationRequest.class))).thenReturn(response);

                mockMvc.perform(post("/api/v1/auth/authenticate")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.token").value("jwt-token"));
        }
}
