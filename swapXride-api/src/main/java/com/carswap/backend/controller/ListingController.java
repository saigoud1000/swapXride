package com.carswap.backend.controller;

import com.carswap.backend.dto.ListingRequest;
import com.carswap.backend.model.Listing;
import com.carswap.backend.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService service;

    @PostMapping
    public ResponseEntity<Listing> createListing(@RequestBody ListingRequest request) {
        return ResponseEntity.ok(service.createListing(request));
    }

    @GetMapping
    public ResponseEntity<List<Listing>> getAllListings(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String make,
            @RequestParam(required = false) String body_type,
            @RequestParam(required = false) Integer min_year,
            @RequestParam(required = false) Integer max_mileage,
            @RequestParam(required = false) Integer min_price,
            @RequestParam(required = false) Integer max_price) {
        return ResponseEntity
                .ok(service.searchListings(q, make, body_type, min_year, max_mileage, min_price, max_price));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Listing>> getMyListings() {
        return ResponseEntity.ok(service.getMyListings());
    }

    @GetMapping("/saved")
    public ResponseEntity<List<Listing>> getSavedListings() {
        return ResponseEntity.ok(service.getSavedListings());
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<Void> toggleSave(@PathVariable UUID id) {
        service.toggleSave(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Listing> getListingById(@PathVariable UUID id) {
        service.incrementViewCount(id);
        return ResponseEntity.ok(service.getListingById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Listing> updateListing(@PathVariable UUID id, @RequestBody ListingRequest request) {
        return ResponseEntity.ok(service.updateListing(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable UUID id) {
        service.deleteListing(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<Void> activateListing(@PathVariable UUID id) {
        service.activateListing(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<Void> verifyListing(@PathVariable UUID id,
            @RequestBody java.util.Map<String, String> payload) {
        String paymentIntentId = payload.get("paymentIntentId");
        service.verifyListing(id, paymentIntentId);
        return ResponseEntity.ok().build();
    }
}
