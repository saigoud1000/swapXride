package com.carswap.backend.service;

import com.carswap.backend.dto.ListingRequest;
import com.carswap.backend.model.Listing;
import com.carswap.backend.model.ListingStatus;
import com.carswap.backend.model.User;
import com.carswap.backend.repository.ListingDbRepository;
import com.carswap.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class ListingServiceTest {

    @Mock
    private ListingDbRepository listingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ListingService listingService;

    private User testUser;
    private Listing testListing;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .build();

        testListing = Listing.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .haveMake("BMW")
                .haveModel("M3")
                .status(ListingStatus.active)
                .build();

        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void searchListings_ShouldReturnListings_WhenFound() {
        when(listingRepository.searchListings(
                anyString(), anyString(), anyString(), anyInt(), anyInt(), anyInt(), anyInt()))
                .thenReturn(Arrays.asList(testListing));

        List<Listing> results = listingService.searchListings("query", "Make", "Sedan", 2020, 50000, 1000, 5000);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("BMW", results.get(0).getHaveMake());
    }

    @Test
    void getListingById_ShouldReturnListing_WhenExists() {
        when(listingRepository.findById(testListing.getId())).thenReturn(java.util.Optional.of(testListing));

        Listing result = listingService.getListingById(testListing.getId());

        assertNotNull(result);
        assertEquals(testListing.getId(), result.getId());
    }

    @Test
    void getListingById_ShouldThrowException_WhenNotFound() {
        when(listingRepository.findById(any(UUID.class))).thenReturn(java.util.Optional.empty());

        assertThrows(RuntimeException.class, () -> listingService.getListingById(UUID.randomUUID()));
    }

    @Test
    void createListing_ShouldSaveAndReturnListing() {
        ListingRequest request = new ListingRequest();
        request.setHaveMake("Audi");
        request.setHaveModel("RS6");
        request.setHaveYear(2021);

        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(listingRepository.save(any(Listing.class))).thenAnswer(i -> i.getArguments()[0]); // Return the saved
                                                                                               // listing to check its
                                                                                               // status

        Listing result = listingService.createListing(request);

        assertNotNull(result);
        assertEquals(ListingStatus.active, result.getStatus());
        assertFalse(result.getIsPaid());
        verify(listingRepository, times(1)).save(any(Listing.class));
    }

    @Test
    void updateListing_ShouldUpdateFields_WhenUserIsOwner() {
        ListingRequest request = new ListingRequest();
        request.setHaveMake("BMW Updated");

        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(listingRepository.findById(testListing.getId())).thenReturn(Optional.of(testListing));
        when(listingRepository.save(any(Listing.class))).thenAnswer(i -> i.getArguments()[0]);

        Listing result = listingService.updateListing(testListing.getId(), request);

        assertEquals("BMW Updated", result.getHaveMake());
    }

    @Test
    void deleteListing_ShouldDelete_WhenUserIsOwner() {
        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(listingRepository.findById(testListing.getId())).thenReturn(Optional.of(testListing));

        listingService.deleteListing(testListing.getId());

        verify(listingRepository, times(1)).delete(testListing);
    }
}
