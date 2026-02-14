package com.carswap.backend.controller;

import com.carswap.backend.dto.ListingRequest;
import com.carswap.backend.model.Listing;
import com.carswap.backend.model.ListingStatus;
import com.carswap.backend.model.User;
import com.carswap.backend.repository.ListingDbRepository;
import com.carswap.backend.repository.UserRepository;
import com.carswap.backend.service.ListingService;
import com.carswap.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ListingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ListingService listingService;

    @MockBean
    private ListingDbRepository listingRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private com.carswap.backend.repository.MessageRepository messageRepository;

    @MockBean
    private com.carswap.backend.repository.SavedListingRepository savedListingRepository;

    // Mock JwtService to avoid application context load failure if it's required by
    // security filter
    @MockBean
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        // Mocks are reset automatically by @MockBean or we can do it here
    }

    @Test
    @WithMockUser
    void shouldReturnAllListings() throws Exception {
        mockMvc.perform(get("/api/v1/listings")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "test-user")
    void shouldCreateListing() throws Exception {
        ListingRequest request = new ListingRequest();
        request.setHaveMake("Honda");
        request.setHaveModel("Civic");
        request.setHaveYear(2022);

        Listing createdListing = Listing.builder()
                .id(UUID.randomUUID())
                .haveMake("Honda")
                .haveModel("Civic")
                .status(ListingStatus.active)
                .build();

        when(listingService.createListing(any(ListingRequest.class)))
                .thenReturn(createdListing);

        mockMvc.perform(post("/api/v1/listings")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"have_make\": \"Honda\", \"have_model\": \"Civic\", \"have_year\": 2022}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.have_make").value("Honda"));
    }

    @Test
    @WithMockUser
    void shouldUpdateListing() throws Exception {
        UUID id = UUID.randomUUID();
        Listing updatedListing = Listing.builder()
                .id(id)
                .haveMake("Updated Make")
                .status(ListingStatus.active)
                .build();

        when(listingService.updateListing(eq(id), any(ListingRequest.class)))
                .thenReturn(updatedListing);

        mockMvc.perform(put("/api/v1/listings/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"have_make\": \"Updated Make\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void shouldDeleteListing() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/listings/" + id))
                .andExpect(status().isNoContent());
    }
}
