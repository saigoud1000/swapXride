package com.carswap.backend.config;

import com.carswap.backend.model.Listing;
import com.carswap.backend.model.ListingStatus;
import com.carswap.backend.model.User;
import com.carswap.backend.repository.ListingDbRepository;
import com.carswap.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.core.env.Environment;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile({ "dev", "e2e" }) // Run in dev and e2e, but not default test which mocks data
public class DataSeeder implements CommandLineRunner {

        private final UserRepository userRepository;
        private final ListingDbRepository listingRepository;
        private final Environment env;

        @Override
        public void run(String... args) throws Exception {
                log.info("Seeding data...");

                // Try to find existing users to attach listings to
                List<User> users = userRepository.findAll();
                User sellerUser;
                User demoUser;

                if (users.isEmpty()) {
                        if (Arrays.asList(env.getActiveProfiles()).contains("e2e")) {
                                log.info("E2E Profile detected: Creating mock users for H2 database.");
                                sellerUser = User.builder()
                                                .id(UUID.fromString("11111111-1111-1111-1111-111111111111"))
                                                .email("seller@test.com")
                                                .displayName("Seller")
                                                .build();
                                demoUser = User.builder()
                                                .id(UUID.fromString("22222222-2222-2222-2222-222222222222"))
                                                .email("demo@test.com")
                                                .displayName("Demo")
                                                .build();
                                userRepository.save(sellerUser);
                                userRepository.save(demoUser);
                                log.info("Created mock users.");
                        } else {
                                log.warn("No users found in database. Cannot seed listings because we cannot create users (Foreign Key constraint to sensitive auth.users). Please sign up a user in the app first.");
                                return;
                        }
                } else if (users.size() >= 2) {
                        demoUser = users.get(0);
                        sellerUser = users.get(1);
                        log.info("Using existing users: {} and {}", demoUser.getEmail(), sellerUser.getEmail());
                } else {
                        // Only one user found
                        demoUser = users.get(0);
                        sellerUser = users.get(0);
                        log.info("Using existing user: {}", demoUser.getEmail());
                }

                // Create Listings
                // Check if listings already exist? listingRepository.count() check is usually
                // enough (removed in previous logic/not present?)
                // Actually the top check `if (userRepository.count() > 0)` returns early, so we
                // wouldn't reach here if users exist.
                // Wait! The original logic returned if users > 0.
                // So if users exist, it skips seeding listings too!
                // That might be why listings weren't showing up if users existed but no
                // listings.
                // I should change the guard clause to check listings count, or remove it and
                // check intelligently.

                if (listingRepository.count() > 0) {
                        log.info("Listings already seeded. Skipping.");
                        return;
                }

                Listing bmwListing = Listing.builder()
                                .user(sellerUser)
                                .haveYear(2020)
                                .haveMake("BMW")
                                .haveModel("M3")
                                .haveTrim("Competition")
                                .bodyType("sedan")
                                .haveMileage(15000)
                                .locationZip("90210")
                                .description("Beautiful M3 Competition. Looking to swap for an SUV.")
                                .condition("excellent")
                                .titleStatus("clean")
                                .status(ListingStatus.active)
                                .isPaid(true)
                                .viewCount(120)
                                .createdAt(OffsetDateTime.now().minusDays(2))
                                .build();

                Listing audiListing = Listing.builder()
                                .user(demoUser)
                                .haveYear(2022)
                                .haveMake("Audi")
                                .haveModel("RS6")
                                .haveTrim("Avant")
                                .bodyType("wagon")
                                .haveMileage(5000)
                                .locationZip("10001")
                                .description("Dream wagon. Need cash.")
                                .condition("like_new")
                                .titleStatus("clean")
                                .status(ListingStatus.active)
                                .isPaid(true)
                                .viewCount(350)
                                .createdAt(OffsetDateTime.now().minusHours(5))
                                .build();

                listingRepository.save(bmwListing);
                listingRepository.save(audiListing);

                log.info("Data seeding completed.");
        }
}
