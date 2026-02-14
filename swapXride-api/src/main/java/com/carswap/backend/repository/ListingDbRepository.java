package com.carswap.backend.repository;

import com.carswap.backend.model.Listing;
import com.carswap.backend.model.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ListingDbRepository extends JpaRepository<Listing, java.util.UUID> {
        List<Listing> findByStatusOrderByCreatedAtDesc(ListingStatus status);

        List<Listing> findByUser_IdOrderByCreatedAtDesc(UUID userId);

        @Query("SELECT l FROM Listing l WHERE " +
                        "(:make = '' OR LOWER(l.haveMake) = LOWER(:make)) AND " +
                        "(:bodyType = '' OR LOWER(l.bodyType) = LOWER(:bodyType)) AND " +
                        "(:minYear = 0 OR l.haveYear >= :minYear) AND " +
                        "(:maxMileage = 2147483647 OR l.haveMileage <= :maxMileage) AND " +
                        "(:minPrice IS NULL OR l.cashDifferentialMin >= :minPrice) AND " +
                        "(:maxPrice IS NULL OR l.cashDifferentialMax <= :maxPrice) AND " +
                        "(:query = '' OR (" +
                        "LOWER(l.haveMake) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(l.haveModel) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(l.description) LIKE LOWER(CONCAT('%', :query, '%')))) " +
                        "ORDER BY l.isPaid DESC, l.createdAt DESC")
        List<Listing> searchListings(
                        @Param("query") String query,
                        @Param("make") String make,
                        @Param("bodyType") String bodyType,
                        @Param("minYear") Integer minYear,
                        @Param("maxMileage") Integer maxMileage,
                        @Param("minPrice") Integer minPrice,
                        @Param("maxPrice") Integer maxPrice);
}