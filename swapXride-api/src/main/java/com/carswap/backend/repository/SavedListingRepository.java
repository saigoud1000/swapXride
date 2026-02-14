package com.carswap.backend.repository;

import com.carswap.backend.model.Listing;
import com.carswap.backend.model.SavedListing;
import com.carswap.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SavedListingRepository extends JpaRepository<SavedListing, java.util.UUID> {

    boolean existsByUserAndListing(User user, Listing listing);

    void deleteByUserAndListing(User user, Listing listing);

    List<SavedListing> findByUserOrderByCreatedAtDesc(User user);
}
