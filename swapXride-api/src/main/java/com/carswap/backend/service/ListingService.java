package com.carswap.backend.service;

import com.carswap.backend.dto.ListingRequest;
import com.carswap.backend.model.Listing;
import com.carswap.backend.model.ListingStatus;
import com.carswap.backend.model.Photo;
import com.carswap.backend.model.SavedListing;
import com.carswap.backend.model.User;
import com.carswap.backend.repository.ListingDbRepository;
import com.carswap.backend.repository.SavedListingRepository;
import com.carswap.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingDbRepository listingRepository;
    private final UserRepository userRepository;
    private final SavedListingRepository savedListingRepository;
    private final PaymentService paymentService;

    public Listing createListing(ListingRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        // Freemium Model: Default to ACTIVE and NOT PAID (Basic Listing)
        ListingStatus initialStatus = ListingStatus.active;
        boolean isPaid = false;

        Listing listing = Listing.builder()
                .user(user)
                .haveYear(request.haveYear)
                .haveMake(request.haveMake)
                .haveModel(request.haveModel)
                .haveTrim(request.haveTrim)
                .haveMileage(request.haveMileage)
                .locationZip(request.locationZip)
                .wantDescription(request.wantDescription)
                .cashDifferentialMin(request.cashDifferentialMin)
                .cashDifferentialMax(request.cashDifferentialMax)
                .description(request.description)
                .condition(request.condition)
                .titleStatus(request.titleStatus)
                .modifications(request.modifications)
                .bodyType(request.bodyType)
                .wantMake(request.wantMake)
                .wantModel(request.wantModel)
                .wantYearMin(request.wantYearMin)
                .cashDirection(request.cashDirection)
                .status(initialStatus)
                .isPaid(isPaid)
                .build();

        if (request.photos != null) {
            List<Photo> photos = request.photos.stream()
                    .map(p -> Photo.builder()
                            .url(p.url)
                            .displayOrder(p.displayOrder)
                            .listing(listing)
                            .build())
                    .toList();
            listing.setPhotos(photos);
        }

        return listingRepository.save(listing);
    }

    @Transactional
    public void verifyListing(UUID id, String paymentIntentId) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        if (paymentService.verifyPayment(paymentIntentId)) {
            listing.setIsPaid(true); // Mark as Verified
            listing.setStripePaymentIntentId(paymentIntentId);
            listingRepository.save(listing);
        } else {
            throw new RuntimeException("Payment verification failed");
        }
    }

    public List<Listing> getAllListings() {
        return listingRepository.findByStatusOrderByCreatedAtDesc(ListingStatus.active);
    }

    public List<Listing> getMyListings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        UUID userId = user.getId();
        if (userId == null)
            throw new RuntimeException("User ID is null");
        return listingRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    public List<Listing> searchListings(String query, String make, String bodyType, Integer minYear, Integer maxMileage,
            Integer minPrice, Integer maxPrice) {
        if ((query == null || query.isBlank()) && make == null && bodyType == null && minYear == null
                && maxMileage == null && minPrice == null && maxPrice == null) {
            return getAllListings();
        }
        String queryParam = (query != null && !query.isBlank()) ? query : "";
        String makeParam = (make != null) ? make : "";
        String bodyTypeParam = (bodyType != null) ? bodyType : "";
        Integer minYearParam = (minYear != null) ? minYear : 0;
        Integer maxMileageParam = (maxMileage != null) ? maxMileage : Integer.MAX_VALUE;

        return listingRepository.searchListings(queryParam, makeParam, bodyTypeParam, minYearParam, maxMileageParam,
                minPrice, maxPrice);
    }

    public Listing updateListing(UUID id, ListingRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        UUID userId = user.getId();
        if (userId == null)
            throw new RuntimeException("User ID is null");
        if (!userId.equals(listing.getUser().getId())) {
            throw new RuntimeException("Unauthorized to update this listing");
        }

        listing.setHaveYear(request.haveYear);
        listing.setHaveMake(request.haveMake);
        listing.setHaveModel(request.haveModel);
        listing.setHaveTrim(request.haveTrim);
        listing.setHaveMileage(request.haveMileage);
        listing.setLocationZip(request.locationZip);
        listing.setWantDescription(request.wantDescription);
        listing.setCashDifferentialMin(request.cashDifferentialMin);
        listing.setCashDifferentialMax(request.cashDifferentialMax);
        listing.setDescription(request.description);
        listing.setCondition(request.condition);
        listing.setTitleStatus(request.titleStatus);
        listing.setTitleStatus(request.titleStatus);
        listing.setModifications(request.modifications);
        listing.setBodyType(request.bodyType);
        listing.setWantMake(request.wantMake);
        listing.setWantModel(request.wantModel);
        listing.setWantYearMin(request.wantYearMin);
        listing.setCashDirection(request.cashDirection);

        if (request.photos != null) {
            listing.getPhotos().clear();
            listing.getPhotos().addAll(request.photos.stream()
                    .map(p -> Photo.builder()
                            .url(p.url)
                            .displayOrder(p.displayOrder)
                            .listing(listing)
                            .build())
                    .toList());
        }

        return listingRepository.save(listing);
    }

    @Transactional
    public void toggleSave(UUID listingId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        if (savedListingRepository.existsByUserAndListing(user, listing)) {
            savedListingRepository.deleteByUserAndListing(user, listing);
        } else {
            SavedListing saved = SavedListing.builder()
                    .user(user)
                    .listing(listing)
                    .build();
            savedListingRepository.save(saved);
        }
    }

    public List<Listing> getSavedListings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        return savedListingRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(SavedListing::getListing)
                .collect(Collectors.toList());
    }

    public void deleteListing(UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        UUID userId = user.getId();
        if (userId == null)
            throw new RuntimeException("User ID is null");
        if (!userId.equals(listing.getUser().getId())) {
            throw new RuntimeException("Unauthorized to delete this listing");
        }

        listingRepository.delete(listing);
    }

    public Listing getListingById(UUID id) {
        return listingRepository.findById(id).orElseThrow(() -> new RuntimeException("Listing not found"));
    }

    public void incrementViewCount(UUID id) {
        listingRepository.findById(id).ifPresent(l -> {
            l.setViewCount(l.getViewCount() + 1);
            listingRepository.save(l);
        });
    }

    @Transactional
    public void activateListing(UUID id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        listing.setStatus(ListingStatus.active);
        listing.setIsPaid(true);
        listingRepository.save(listing);
    }
}
